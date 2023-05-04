module.exports = {
  root: true,
  env: {
    browser: false,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: [
    'dist/**',
    '**/*.json',
    'coverage/**',
    'docs/**',
    'src/index.cjs.js',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      env: { 'browser': false, 'es6': true, 'node': true },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        indent: ['error', 2, { SwitchCase: 1 }],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/no-explicit-any': 0
      }
    }
  ]
};
