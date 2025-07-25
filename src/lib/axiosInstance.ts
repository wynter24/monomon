import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://wynter24-pokemon-face-match.hf.space',
  timeout: 30000,
});

// TODO: 로그인 기능 추가 시 interceptor 추가
// api.interceptors.request.use((config) => {...});
