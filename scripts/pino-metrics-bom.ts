//   npx tsx scripts/pino-metrics-bom.ts <logfile> [/api/match|all|list] [BATCH_ID]
//   e.g.
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log /api/match 9a3c...-...-...
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log all
//   npx tsx scripts/pino-metrics-bom.ts ./pino-prod.log list

import * as fs from 'fs';

type Any = Record<string, any>;

// ===== CLI Args =====
const file = process.argv[2] || './pino.log';
const targetArgRaw = process.argv[3] || '/api/match';
const batchIdArg = (process.argv[4] || '').trim();
const targetArg = targetArgRaw.toLowerCase();
const MODE_LIST = targetArg === 'list';
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
  // Some providers may wrap structured fields differently
  return { ...outer, ...(inner || {}) };
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

// Batch ID is recorded either as explicit field or via headers
function extractBatchId(rec: Any): string | undefined {
  if (typeof rec.batch_id === 'string' && rec.batch_id) return rec.batch_id;

  const headers =
    rec.headers ||
    rec.req?.headers ||
    rec.request?.headers ||
    rec.meta?.headers;

  if (headers && typeof headers === 'object') {
    // case-insensitive lookup
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

// ===== list mode: show top 20 paths =====
if (MODE_LIST) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const rec = parseLine(line);
    if (!rec) continue;
    const p = normalizePath(extractPath(rec)) || '(no-path)';
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log('Top paths:');
  for (const [p, c] of top) console.log(String(c).padStart(6), p);
  process.exit(0);
}

// ===== Aggregate =====
let total = 0;
let errors = 0;
const durations: number[] = [];

for (const line of lines) {
  const rec = parseLine(line);
  if (!rec) continue;

  // Batch filter (exact match)
  if (batchIdArg) {
    const bid = extractBatchId(rec);
    if (bid !== batchIdArg) continue;
  }

  // Path filter (unless "all")
  const p = normalizePath(extractPath(rec));
  if (!MODE_ALL) {
    if (!p) continue;
    if (p !== normalizePath(targetArg)) continue;
  }

  const msg = extractMsg(rec);
  const status = extractStatus(rec);
  const dur = extractDuration(rec);

  // Primary: rely on msg tags if present
  if (msg && DONE.has(msg)) {
    total++;
    if (typeof status === 'number' && status >= 500) errors++;
    if (typeof dur === 'number') durations.push(dur);
    continue;
  }
  if (msg && ERR.has(msg)) {
    total++;
    errors++;
    if (typeof dur === 'number') durations.push(dur);
    continue;
  }

  // Fallback: if format changed, still count meaningful records
  // - If we have a status or duration, treat as a completed record.
  if (typeof status === 'number' || typeof dur === 'number') {
    total++;
    if (typeof status === 'number' && status >= 500) errors++;
    if (typeof dur === 'number') durations.push(dur);
  }
}

// ===== Percentiles =====
durations.sort((a, b) => a - b);
const pct = (q: number) => {
  if (!durations.length) return null;
  const idx = Math.ceil(q * durations.length) - 1;
  return durations[Math.max(0, Math.min(idx, durations.length - 1))]!;
};

// ===== Output =====
console.log('--- Metrics for', MODE_ALL ? 'ALL PATHS' : targetArg, '---');
if (batchIdArg) console.log('batch_id:', batchIdArg);
console.log('total:', total);
console.log('errors:', errors);
console.log(
  'error_rate_pct:',
  total ? ((100 * errors) / total).toFixed(2) : '0.00',
);
console.log('p50_ms:', pct(0.5) ?? '-');
console.log('p95_ms:', pct(0.95) ?? '-');
console.log('p99_ms:', pct(0.99) ?? '-');
