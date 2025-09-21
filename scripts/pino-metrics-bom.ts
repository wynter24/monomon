// 정확히 N개의 요청만 계산하는 pino 메트릭 스크립트
// 사용법: npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log "/api/match" BATCH_ID 100

import * as fs from 'fs';

type Any = Record<string, any>;

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

// JSON safe parse
const safeParse = (s?: string | null): Any | null => {
  if (!s) return null;
  try {
    return JSON.parse(stripBOM(s));
  } catch {
    return null;
  }
};

// Parse one log line: outer JSON (Vercel) + inner pino JSON inside message/text/data/log
function parseLine(line: string): Any | null {
  const outer = safeParse(line);
  if (!outer) return null;

  let inner: Any | null = null;
  for (const k of ['message', 'text', 'data', 'log']) {
    if (typeof outer[k] === 'string') {
      inner = safeParse(outer[k]);
      if (inner) break;
    }
  }
  return {
    ...outer,
    ...(inner || {}),
    _timestamp: outer.timestampInMs || outer.time || Date.now(),
  };
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
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

const extractMsg = (rec: Any): string | undefined =>
  typeof rec.msg === 'string' ? rec.msg : undefined;

const extractStatus = (rec: Any): number | undefined => {
  const s =
    rec.status ??
    rec.statusCode ??
    rec.code ??
    rec.upstream_status ??
    rec.responseStatusCode ??
    rec.res?.statusCode;
  return typeof s === 'number' ? s : undefined;
};

const extractDuration = (rec: Any): number | undefined => {
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
    rec.meta?.headers;

  if (headers && typeof headers === 'object') {
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === 'x-batch-id') {
        const v = headers[k];
        if (typeof v === 'string' && v) return v;
      }
    }
  }
  return undefined;
}

// ===== Read file (BOM-safe) =====
const raw = stripBOM(fs.readFileSync(file, 'utf8'));
const lines = raw
  .split(/\r?\n/)
  .map((l) => stripBOM(l.trim()))
  .filter(Boolean);

console.log(`전체 로그 라인: ${lines.length}개`);
console.log(`배치 ID: ${batchIdArg}`);
console.log(`최대 개수: ${maxCount}개`);

// ===== 매칭되는 레코드들을 먼저 수집 =====
const matchedRecords: Array<{
  rec: Any;
  timestamp: number;
  msg?: string;
  status?: number;
  duration?: number;
}> = [];

for (const line of lines) {
  const rec = parseLine(line);
  if (!rec) continue;

  // Batch filter (필수)
  if (batchIdArg) {
    const bid = extractBatchId(rec);
    if (bid !== batchIdArg) continue;
  }

  // Path filter
  const p = normalizePath(extractPath(rec));
  if (!MODE_ALL) {
    if (!p || p !== normalizePath(targetArg)) continue;
  }

  const msg = extractMsg(rec);
  const status = extractStatus(rec);
  const duration = extractDuration(rec);

  // api_done/api_error 메시지가 있거나, status/duration이 있는 완료된 요청만
  const isCompleted =
    (msg && (DONE.has(msg) || ERR.has(msg))) ||
    typeof status === 'number' ||
    typeof duration === 'number';

  if (isCompleted) {
    matchedRecords.push({
      rec,
      timestamp: rec._timestamp,
      msg,
      status,
      duration,
    });
  }
}

console.log(`매칭된 레코드: ${matchedRecords.length}개`);

// ===== 타임스탬프 기준으로 정렬 (가장 최근 것부터) =====
matchedRecords.sort((a, b) => b.timestamp - a.timestamp);

// ===== 정확히 maxCount개만 선택 =====
const selectedRecords = matchedRecords.slice(0, maxCount);
console.log(`선택된 레코드: ${selectedRecords.length}개`);

if (selectedRecords.length < maxCount) {
  console.log(
    `⚠️  요청된 ${maxCount}개보다 적은 ${selectedRecords.length}개만 발견됨`,
  );
}

// ===== 메트릭 계산 =====
let total = selectedRecords.length;
let errors = 0;
const durations: number[] = [];

for (const { msg, status, duration } of selectedRecords) {
  // 에러 판정
  if ((msg && ERR.has(msg)) || (typeof status === 'number' && status >= 500)) {
    errors++;
  }

  // duration 수집
  if (typeof duration === 'number' && duration > 0) {
    durations.push(duration);
  }
}

// ===== 퍼센타일 계산 =====
durations.sort((a, b) => a - b);
const pct = (q: number) => {
  if (!durations.length) return null;
  const idx = Math.ceil(q * durations.length) - 1;
  return durations[Math.max(0, Math.min(idx, durations.length - 1))]!;
};

// ===== 출력 =====
console.log('\n=== 정확한 메트릭 결과 ===');
console.log('--- Metrics for', MODE_ALL ? 'ALL PATHS' : targetArg, '---');
console.log('batch_id:', batchIdArg);
console.log('requested_count:', maxCount);
console.log('actual_count:', total);
console.log('errors:', errors);
console.log(
  'error_rate_pct:',
  total ? ((100 * errors) / total).toFixed(2) : '0.00',
);
console.log('durations_collected:', durations.length);
console.log('p50_ms:', pct(0.5) ?? '-');
console.log('p95_ms:', pct(0.95) ?? '-');
console.log('p99_ms:', pct(0.99) ?? '-');

if (durations.length > 0) {
  console.log('min_ms:', Math.min(...durations));
  console.log('max_ms:', Math.max(...durations));
  console.log(
    'avg_ms:',
    (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2),
  );
}

// ===== 디버깅 정보 =====
if (selectedRecords.length > 0) {
  const first = selectedRecords[selectedRecords.length - 1]; // 가장 오래된 것 (첫 번째)
  const last = selectedRecords[0]; // 가장 최신 것 (마지막)

  console.log('\n=== 시간 범위 ===');
  console.log('첫 번째 요청:', new Date(first.timestamp).toISOString());
  console.log('마지막 요청:', new Date(last.timestamp).toISOString());
  console.log(
    '총 소요 시간:',
    ((last.timestamp - first.timestamp) / 1000).toFixed(1) + '초',
  );
}
