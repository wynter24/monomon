import axios, { AxiosHeaders } from 'axios';
import { v4 as uuid } from 'uuid';

export const api = axios.create({
  baseURL: '',
  timeout: 30000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const requestId = (config.headers?.['x-request-id'] as string) ?? uuid();
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);
  headers.set('x-request-id', requestId);
  config.headers = headers;
  (config as any).meta = { start: Date.now(), requestId };
  return config;
});

api.interceptors.response.use(
  (res) => {
    // const meta = (res.config as any)?.meta;
    // if (meta) {
    //   const duration = Date.now() - meta.start;
    // NOTE: 성공 시에도 필요하면 console.log 또는 lightweight 측정 가능
    // 여기선 서버 미들웨어가 성공 로그를 찍으니 생략 가능
    // }
    return res;
  },
  async (error) => {
    // const cfg: any = error.config || {};
    // const meta = cfg.meta || {};
    // const duration = Date.now() - (meta.start || Date.now());
    // const requestId = meta.requestId;

    // 네트워크/타임아웃 유형 구분
    // let event = 'client_network_error';
    // if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    //   event = 'client_timeout_failed';
    // }

    // TODO: 서버 /log로 전송 — 서버에서 Supabase에 통합 저장
    // try {
    //   await fetch(`${process.env.API_BASE}/log`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       request_id: requestId,
    //       route: cfg.url,
    //       event,
    //       duration_ms: duration,
    //       detail: { code: error.code, message: error.message },
    //     }),
    //   });
    // } catch {
    //   // 로깅 실패는 무시
    // }
    return Promise.reject(error);
  },
);
