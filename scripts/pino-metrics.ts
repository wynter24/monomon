// 사용법:
//   npx tsx scripts/pino-metrics-lite.ts ./pino-prod.log "/api/match"
//   npx tsx scripts/pino-metrics-lite.ts ./pino-prod.log all
import * as fs from 'fs';

const file = process.argv[2] || './pino.log';
const target = (process.argv[3] || '/api/match').toLowerCase();
const MODE_ALL = target === 'all';

const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);

let total = 0;
let errors = 0;
const durations: number[] = [];

for (const line of lines) {
  // 1) msg 판별 (바깥/안쪽 어디에 있어도 문자열로 탐지)
  const hasDone =
    line.includes('"msg":"api_done"') || line.includes('"msg":"match_done"');
  const hasError =
    line.includes('"msg":"api_error"') || line.includes('"msg":"match_error"');
  if (!hasDone && !hasError) continue;

  // 2) 경로 필터 (path / route / requestPath / 문자열 포함 어느 쪽이든 OK)
  if (!MODE_ALL) {
    const hit =
      line.includes(`"path":"${target}"`) ||
      line.includes(`"route":"${target}"`) ||
      line.includes(`"requestPath":"${target}"`) ||
      line.includes(`"${target}"`); // 최후 방어
    if (!hit) continue;
  }

  // 3) duration_ms 추출 (안쪽 JSON 우선, 어디 있어도 OK)
  let dur: number | null = null;
  {
    const m = line.match(/"duration_ms"\s*:\s*(\d+)/);
    if (m) dur = Number(m[1]);
  }

  // 4) status 추출 (안쪽 status 우선, 없으면 responseStatusCode도 시도)
  let status: number | null = null;
  {
    const m1 = line.match(/"status"\s*:\s*(\d+)/);
    const m2 = line.match(/"upstream_status"\s*:\s*(\d+)/);
    const m3 = line.match(/"responseStatusCode"\s*:\s*(-?\d+)/);
    if (m1) status = Number(m1[1]);
    else if (m2) status = Number(m2[1]);
    else if (m3) status = Number(m3[1]); // 바깥 필드(없으면 -1일 수 있음)
  }

  total++;
  if (hasError || (typeof status === 'number' && status >= 500)) errors++;
  if (typeof dur === 'number') durations.push(dur);
}

// 퍼센타일 계산
durations.sort((a, b) => a - b);
const pct = (q: number) => {
  if (!durations.length) return null;
  const idx = Math.ceil(q * durations.length) - 1;
  return durations[Math.max(0, Math.min(idx, durations.length - 1))]!;
};

console.log('--- Metrics for', MODE_ALL ? 'ALL PATHS' : target, '---');
console.log('total:', total);
console.log('errors:', errors);
console.log(
  'error_rate_pct:',
  total ? ((100 * errors) / total).toFixed(2) : '0.00',
);
console.log('p50_ms:', pct(0.5) ?? '-');
console.log('p95_ms:', pct(0.95) ?? '-');
console.log('p99_ms:', pct(0.99) ?? '-');
