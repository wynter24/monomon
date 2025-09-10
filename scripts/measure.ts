import fs from 'fs';

const BASE = process.env.API_BASE || 'http://localhost:7860';
const N = Number(process.env.N || 50);
const TEST_IMAGE_URL =
  process.env.TEST_IMAGE_URL ||
  'https://res.cloudinary.com/demo/image/upload/sample.jpg'; // 고정 테스트용

async function main() {
  const rows: (string | number)[][] = [['idx', 'duration_ms', 'status']];

  for (let i = 1; i <= N; i++) {
    const start = Date.now();
    let status = 'ok';
    try {
      const res = await fetch(`${BASE}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ image_url: TEST_IMAGE_URL }),
      });
      if (!res.ok) status = `http_${res.status}`;
    } catch {
      status = 'network_error';
    }
    rows.push([i, Date.now() - start, status]);
    await new Promise((r) => setTimeout(r, 200)); // 호출 간 200ms 간격
  }

  fs.writeFileSync(
    './latency_match.csv',
    rows.map((r) => r.join(',')).join('\n'),
  );
  console.log('✅ saved latency_match.csv');
}

main();
