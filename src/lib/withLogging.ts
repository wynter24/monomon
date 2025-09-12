import { logger } from './logger';

export function withLogging<
  H extends (req: Request, ...a: any[]) => Promise<Response> | Response,
>(handler: H) {
  return async (req: Request, ...args: any[]) => {
    const started = performance.now();
    try {
      const res = await handler(req, ...args);
      const duration = Math.round(performance.now() - started);
      const bid = req.headers.get('x-batch-id') ?? undefined;
      logger.info({
        msg: 'api_done',
        method: req.method,
        path: new URL(req.url).pathname,
        status: res.status,
        duration_ms: duration,
        request_id: res.headers.get('x-request-id') ?? undefined,
        batch_id: bid,
      });
      return res;
    } catch (err: any) {
      const duration = Math.round(performance.now() - started);
      const bid = req.headers.get('x-batch-id') ?? undefined;
      logger.error({
        msg: 'api_error',
        method: req.method,
        path: new URL(req.url).pathname,
        duration_ms: duration,
        error: err?.message,
        batch_id: bid,
      });
      throw err;
    }
  };
}
