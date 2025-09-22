// 사용법: npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log "/api/match" BATCH_ID 100
// 출력: 라벨 있는 다줄 텍스트
// 옵션: VERBOSE=1(디버그), PRINT_HEADER=0(헤더 비활성)

import * as fs from 'fs';

type Any = Record<string, any>;

// ===== DQ rules (필요시 조정) =====
const DQ_KEYWORDS = ['dq', 'validation', 'schema'];
const DQ_STATUS = new Set([400, 422]);

// ===== Env flags =====
const VERBOSE = process.env.VERBOSE === '1';

// ===== CLI Args =====
const file = process.argv[2] || './pino.log';
const targetArgRaw = process.argv[3] || '/api/match';
const batchIdArg = (process.argv[4] || '').trim();
const maxCount = parseInt(process.argv[5] || '100', 10);
const targetArg = targetArgRaw.toLowerCase();
const MODE_ALL = targetArg === 'all';

// ===== Helpers =====
const stripBOM = (s: string) => s.replace(/^\uFEFF/, '');
const normalizePath = (p?: string) =>
  (p || '')
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '')
    .toLowerCase();

const DONE = new Set(['api_done', 'match_done']);
const ERR = new Set(['api_error', 'match_error']);

const safeParse = (s?: string | null): Any | null => {
  if (!s) return null;
  try {
    return JSON.parse(stripBOM(s));
  } catch {
    return null;
  }
};

function parseLine(line: string): Any | null {
  const outer = safeParse(line);
  if (!outer) return null;
  let inner: Any | null = null;
  for (const k of [
    'message',
    'text',
    'data',
    'log',
    'body',
    'payload',
    'content',
  ]) {
    if (typeof outer[k] === 'string') {
      inner = safeParse(outer[k]);
      if (inner) break;
    }
  }
  let ts = outer.timestampInMs || outer.timestamp || outer.time || outer.ts;
  if (typeof ts === 'string') {
    const t = new Date(ts).getTime();
    ts = isNaN(t) ? Date.now() : t;
  }
  if (typeof ts !== 'number') ts = Date.now();
  return { ...outer, ...(inner || {}), _timestamp: ts };
}

function extractPath(rec: Any): string | undefined {
  if (typeof rec.path === 'string') return rec.path;
  if (typeof rec.route === 'string') return rec.route;
  if (typeof rec.pathname === 'string') return rec.pathname;
  if (typeof rec.requestPath === 'string') return rec.requestPath;
  if (typeof rec.eventPath === 'string') return rec.eventPath;
  const urlLike =
    rec.url ||
    rec.req?.url ||
    rec.request?.url ||
    rec.originalUrl ||
    rec.req?.originalUrl;
  if (typeof urlLike === 'string') {
    try {
      const u = urlLike.startsWith('http')
        ? new URL(urlLike)
        : new URL(urlLike, 'http://x');
      return u.pathname;
    } catch {}
  }
  return undefined;
}
const extractMsg = (rec: Any) =>
  typeof rec.msg === 'string' ? rec.msg : undefined;
const extractEvent = (rec: Any) =>
  typeof rec.event === 'string' ? rec.event : undefined;
const extractErrorType = (rec: Any) =>
  typeof rec.error_type === 'string' ? rec.error_type : undefined;
const extractStatus = (rec: Any) => {
  const s =
    rec.status ??
    rec.statusCode ??
    rec.code ??
    rec.upstream_status ??
    rec.responseStatusCode ??
    rec.res?.statusCode;
  return typeof s === 'number' ? s : undefined;
};
const extractDuration = (rec: Any) => {
  const d =
    rec.duration_ms ??
    rec.latency_ms ??
    rec.duration ??
    rec.responseTime ??
    rec.res?.responseTime;
  return typeof d === 'number' ? d : undefined;
};
function extractBatchId(rec: Any): string | undefined {
  if (typeof rec.batch_id === 'string' && rec.batch_id) return rec.batch_id;
  const headers =
    rec.headers ||
    rec.req?.headers ||
    rec.request?.headers ||
    rec.meta?.headers ||
    rec.http?.headers ||
    rec.context?.headers;
  if (headers && typeof headers === 'object') {
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === 'x-batch-id') {
        const v = (headers as Any)[k];
        if (typeof v === 'string' && v) return v;
      }
    }
  }
  return undefined;
}
const dateStr = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ===== Read file =====
const normalizedFile =
  file.startsWith('/') || /^[A-Za-z]:/.test(file)
    ? file
    : require('path').resolve(process.cwd(), file);
if (!fs.existsSync(normalizedFile)) {
  console.error(`❌ 파일 없음: ${normalizedFile}`);
  process.exit(1);
}
const raw = stripBOM(fs.readFileSync(normalizedFile, 'utf8'));
const lines = raw
  .split(/\r?\n/)
  .map((l) => stripBOM(l.trim()))
  .filter(Boolean);

// ===== Collect =====
type RecWrap = {
  timestamp: number;
  path?: string;
  msg?: string;
  event?: string;
  error_type?: string;
  status?: number;
  duration?: number;
};
const records: RecWrap[] = [];
for (const line of lines) {
  const rec = parseLine(line);
  if (!rec) continue;
  if (batchIdArg) {
    const bid = extractBatchId(rec);
    if (bid !== batchIdArg) continue;
  }
  const p = normalizePath(extractPath(rec));
  if (!MODE_ALL) {
    if (!p || p !== normalizePath(targetArg)) continue;
  }
  const msg = extractMsg(rec);
  const status = extractStatus(rec);
  const duration = extractDuration(rec);
  const event = extractEvent(rec);
  const error_type = extractErrorType(rec);
  const isCompleted =
    (msg && (DONE.has(msg) || ERR.has(msg))) ||
    typeof status === 'number' ||
    typeof duration === 'number';
  if (isCompleted)
    records.push({
      timestamp: rec._timestamp,
      path: p,
      msg,
      event,
      error_type,
      status,
      duration,
    });
}
// 최신순 → N개
records.sort((a, b) => b.timestamp - a.timestamp);
const selected = records.slice(0, maxCount);

// ===== Metrics =====
const isFail = (r: RecWrap) =>
  (r.msg && ERR.has(r.msg)) ||
  (typeof r.status === 'number' && r.status >= 500);
const isDQ = (r: RecWrap) => {
  const ev = (r.event || r.msg || '').toLowerCase();
  const et = (r.error_type || '').toLowerCase();
  if (r.status && DQ_STATUS.has(r.status)) return true;
  if (DQ_KEYWORDS.some((k) => ev.includes(k))) return true;
  if (DQ_KEYWORDS.some((k) => et.includes(k))) return true;
  return false;
};

const total = selected.length;
const errors = selected.filter(isFail).length;
const errRate = total ? (errors / total) * 100 : 0;
const availability = 100 - errRate;

const durations = selected
  .map((r) => r.duration)
  .filter((n): n is number => typeof n === 'number' && n > 0)
  .sort((a, b) => a - b);
const pct = (q: number) =>
  durations.length
    ? durations[
        Math.max(
          0,
          Math.min(Math.ceil(q * durations.length) - 1, durations.length - 1),
        )
      ]
    : null;
const p95 = pct(0.95);

const asc = [...selected].sort((a, b) => a.timestamp - b.timestamp);
let openStart: number | null = null;
const spans: number[] = [];
for (const r of asc) {
  const fail = isFail(r);
  if (fail && openStart == null) openStart = r.timestamp;
  else if (!fail && openStart != null) {
    spans.push(r.timestamp - openStart);
    openStart = null;
  }
}
const mttrMin = spans.length
  ? spans.reduce((a, b) => a + b, 0) / spans.length / 60000
  : null;

const dqViolations = selected.filter(isDQ).length;
const dqRate = total ? (dqViolations / total) * 100 : 0;

// 날짜(최신 레코드 기준)
const dayStr = dateStr(selected[0]?.timestamp ?? Date.now());

// ===== Pretty Output =====
const p95Str = p95 == null ? '-' : String(Math.round(p95));
const mttrStr = mttrMin == null ? '-' : mttrMin.toFixed(2);

console.log(`날짜 : ${dayStr}`);
console.log(`전체 요청 : ${total}`);
console.log(`실패(5xx/로직) : ${errors}`);
console.log(`에러율% : ${errRate.toFixed(2)}`);
console.log(`P95(ms) : ${p95Str}`);
console.log(`가용성% : ${availability.toFixed(2)}`);
console.log(`MTTR(분) : ${mttrStr}`);
console.log(`DQ 위반율% : ${dqRate.toFixed(2)}`);

if (VERBOSE) {
  console.log('\n[debug]');
  console.log('file:', normalizedFile);
  console.log('target:', MODE_ALL ? 'ALL PATHS' : targetArg);
  console.log('batch_id:', batchIdArg);
  console.log('requested_count:', maxCount);
  console.log('selected_count:', total);
  if (total > 0) {
    const first = asc[0],
      last = asc[asc.length - 1];
    console.log(
      'time_window:',
      new Date(first.timestamp).toISOString(),
      '→',
      new Date(last.timestamp).toISOString(),
    );
  }
}
