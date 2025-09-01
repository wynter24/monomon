import '@testing-library/jest-dom';

// 테스트 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// 실패 케이스 테스트에서 콘솔 에러 숨기기
let errSpy: jest.SpyInstance;

beforeAll(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  errSpy.mockRestore();
});
