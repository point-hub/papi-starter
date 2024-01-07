/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  root: true,
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    /** @type {import("prettier").Config} */
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        tabWidth: 2,
        semi: false,
        singleQuote: true,
      },
    ],
  },
}
