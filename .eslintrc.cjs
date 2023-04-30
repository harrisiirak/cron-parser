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
  "ignorePatterns": [
    "lib/**",
    "**/*.json",
    "coverage/**",
    "docs/**",
    "src/index.cjs.js",
  ],
  "parserOptions": {
    // "ecmaFeatures": { "jsx": true },
    "ecmaVersion": 2022,
    "sourceType": "module",
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "env": { "browser": false, "es6": true, "node": true },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        // "ecmaFeatures": { "jsx": true },
        "ecmaVersion": 2022,
        "sourceType": "module",
        // "project": "./tsconfig.esm.json"
      },
      "plugins": ["@typescript-eslint"],
      "rules": {
        "indent": ["error", 2, { "SwitchCase": 1 }],
        // "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        "@typescript-eslint/no-explicit-any": 0
      }
    }
  ]
};
