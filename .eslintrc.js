/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: '@uniswap/eslint-config/react',
  overrides: [
    {
      // Configuration/typings typically export objects/definitions that are used outside of the transpiled package
      // (eg not captured by the tsconfig). Because it's typical and not exceptional, this is turned off entirely.
      files: ['**/*.config.*', '**/*.d.ts', '**/*.ts', '**/*.tsx'],
      rules: {
        'import/no-unused-modules': 'off',
        'react/prop-types': 'off',
        'react/jsx-curly-brace-presence': 'off',
        'simple-import-sort/imports': 'off',
      },
    },
  ],
}
