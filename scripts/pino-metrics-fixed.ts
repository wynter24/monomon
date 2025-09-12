// 사용 예:
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log "/api/match"
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log all
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log list
import * as fs from 'fs';

type Any = Record<string, any>;

const file = process.argv[2] || './pino.log';
const targetArg = (process.argv[3] || '/api/match').toLowerCase();
const MODE_LIST = targetArg === 'list';
const MODE_ALL = targetArg === 'all';

const stripBOM = (s: string) => s.replace(/^\uFEFF/, '');

// 파일 읽기 + BOM 제거
const raw = stripBOM(fs.readFileSync(file, 'utf8'));
const lines = raw
  .split(/\r?\n/)
  .map((l) => stripBOM(l.trim()))
  .filter(Boolean);

const DONE = new Set(['api_done', 'match_done']);
const ERR = new Set(['api_error', 'match_error']);

// 안전 파서
const safeParse = (s?: string | null): Any | null => {
  if (!s) return null;
  try {
    return JSON.parse(stripBOM(s));
  } catch {
    return null;
  }
};

// 한 줄 파싱: 바깥 JSON + message(안쪽 JSON) 머지
function parseLine(line: string): Any | null {
  const outer = safeParse(line); // { level, message, requestPath, ... }
  if (!outer) return null;

  let inner: Any | null = null;
  // Vercel 외부 JSON의 message/text/data/log 중 하나에 pino JSON 문자열이 들어 있음
  for (const k of ['message', 'text', 'data', 'log']) {
    if (typeof outer[k] === 'string') {
      inner = safeParse(outer[k]);
      if (inner) break;
    }
  }
  return { ...outer, ...(inner || {}) };
}

const extractPath = (rec: Any): string | undefined => {
  if (typeof rec.path === 'string') return rec.path; // pino(inner)
  if (typeof rec.route === 'string') return rec.route;
  if (typeof rec.pathname === 'string') return rec.pathname;
  if (typeof rec.requestPath === 'string') return rec.requestPath; // vercel(outer)
  const urlLike = rec.url || rec.req?.url || rec.request?.url;
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
};

const extractMsg = (rec: Any): string | undefined =>
  typeof rec.msg === 'string' ? rec.msg : undefined;

const extractStatus = (rec: Any): number | undefined => {
  const s =
    rec.status ??
    rec.upstream_status ??
    rec.responseStatusCode ??
    rec.code ??
    rec.statusCode;
  return typeof s === 'number' ? s : undefined;
};

const extractDuration = (rec: Any): number | undefined => {
  const d = rec.duration_ms ?? rec.latency_ms ?? rec.duration;
  return typeof d === 'number' ? d : undefined;
};

// list 모드: path 상위 분포
if (MODE_LIST) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const rec = parseLine(line);
    if (!rec) continue;
    const p = extractPath(rec) ?? '(no-path)';
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log('Top paths:');
  for (const [p, c] of top) console.log(String(c).padStart(6), p);
  process.exit(0);
}

// 집계
let total = 0;
let errors = 0;
const durations: number[] = [];

for (const line of lines) {
  const rec = parseLine(line);
  if (!rec) continue;

  const p = extractPath(rec);
  if (!MODE_ALL) {
    if (!p) continue;
    if (p.toLowerCase() !== targetArg) continue;
  }

  const msg = extractMsg(rec);
  const status = extractStatus(rec);
  const dur = extractDuration(rec);

  if (msg && DONE.has(msg)) {
    total++;
    if (typeof status === 'number' && status >= 500) errors++;
    if (typeof dur === 'number') durations.push(dur);
  } else if (msg && ERR.has(msg)) {
    total++;
    errors++;
    if (typeof dur === 'number') durations.push(dur);
  }
}

// 퍼센타일
durations.sort((a, b) => a - b);
const pct = (q: number) => {
  if (!durations.length) return null;
  const idx = Math.ceil(q * durations.length) - 1;
  return durations[Math.max(0, Math.min(idx, durations.length - 1))]!;
};

console.log('--- Metrics for', MODE_ALL ? 'ALL PATHS' : targetArg, '---');
console.log('total:', total);
console.log('errors:', errors);
console.log(
  'error_rate_pct:',
  total ? ((100 * errors) / total).toFixed(2) : '0.00',
);
console.log('p50_ms:', pct(0.5) ?? '-');
console.log('p95_ms:', pct(0.95) ?? '-');
console.log('p99_ms:', pct(0.99) ?? '-');
