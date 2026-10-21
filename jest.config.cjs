/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  // 让依赖按 Node 条件解析（取 CJS 构建），避免 Jest 命中 vue-i18n 等库的浏览器 ESM 包
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.(spec|test).[jt]s',
    '**/?(*.)+(spec|test).[jt]s',
  ],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass|less)$': '<rootDir>/test/styleMock.cjs',
    '\\.(png|jpe?g|gif|webp|svg)$': '<rootDir>/test/fileMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,vue}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/main.ts',
  ],
};
