import pino from 'pino';

const dev = process.env.NODE_ENV !== 'production';
const toFile = process.env.LOG_TO_FILE === '1'; // 로컬에서만 쓰세요

export const logger = pino(
  { level: dev ? 'debug' : 'info' },
  toFile ? pino.destination({ dest: './pino.log', sync: false }) : undefined,
);
