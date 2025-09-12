import { logger } from './logger';

export function withLogging<
  H extends (req: Request, ...a: any[]) => Promise<Response> | Response,
>(handler: H) {
  return async (req: Request, ...args: any[]) => {
    const started = performance.now();
    const u = new URL(req.url);
    const bid = req.headers.get('x-batch-id') ?? undefined;
    try {
      const res = await handler(req, ...args);
      logger.info({
        msg: 'api_done',
        method: req.method,
        path: u.pathname,
        url: u.toString(),
        search: u.search || null,
        status: res.status,
        duration_ms: Math.round(performance.now() - started),
        request_id: res.headers.get('x-request-id') ?? undefined,
        batch_id: bid,
      });
      return res;
    } catch (err: any) {
      logger.error({
        msg: 'api_error',
        method: req.method,
        path: u.pathname,
        url: u.toString(),
        search: u.search || null,
        duration_ms: Math.round(performance.now() - started),
        error: err?.message,
        batch_id: bid,
      });
      throw err;
    }
  };
}
