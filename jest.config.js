export default {
  testMatch: [
    '**/tests/**/*.test.ts'
  ],
  extensionsToTreatAsEsm: [
    '.ts'
  ],
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.esm.json'
      }
    ]
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    '!test/**/*',
    '!types/**/*',
    '!lib/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
