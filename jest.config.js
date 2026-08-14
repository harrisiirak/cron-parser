module.exports = {
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.worktrees/'],
  modulePathIgnorePatterns: ['/.worktrees/'],
  verbose: false,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!dist/**/*'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 90,
      lines: 99,
      statements: 99,
    },
  },
};
