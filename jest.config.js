const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // next.config.js 및 .env 파일을 테스트 환경에 로드하기 위해 Next.js 앱 경로를 제공합니다.
  dir: './',
})

// Jest에 전달할 사용자 정의 구성을 추가합니다.
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
}

// next/jest가 Next.js 구성을 로드할 수 있도록 createJestConfig가 이 방식으로 내보내집니다.
module.exports = createJestConfig(config)