export default {
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js',
  ],
  extensionsToTreatAsEsm: [
    '.ts'
  ],
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts)?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.esm.json'
      }
    ]
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!dist/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 90,
      lines: 99,
      statements: 99,
    },
  },
};
