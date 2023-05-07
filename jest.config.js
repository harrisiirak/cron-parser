export default {
  testMatch: [
    '**/tests/**/*.test.ts'
  ],
  extensionsToTreatAsEsm: [
    '.ts'
  ],
  verbose: false,
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  // required for jest to resolve esm modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        // tsconfig: 'tsconfig.esm.json'
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
