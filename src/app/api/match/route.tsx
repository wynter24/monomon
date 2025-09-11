import { withLogging } from '@/lib/withLogging';

const BASE = process.env.API_BASE!;

async function handler(req: Request) {
  const contentType =
    req.headers.get('content-type') ?? 'application/octet-stream';
  const body = await req.arrayBuffer();

  const upstream = await fetch(`${BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });

  const payload = await upstream.arrayBuffer();
  return new Response(payload, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const POST = withLogging(handler);
export const runtime = 'nodejs';
