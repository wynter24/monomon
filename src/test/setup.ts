import '@testing-library/jest-dom';

// 실패 케이스 테스트에서 콘솔 에러 숨기기
let errSpy: jest.SpyInstance;

beforeAll(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  errSpy.mockRestore();
});
