import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import regexp from 'eslint-plugin-regexp';

export default [
  {
    files: ['**/*.ts', '**/*.mjs'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  // What GitHub Code Quality checked, checked here instead.
  //
  // Code Quality runs CodeQL's JavaScript quality suite — every query tagged
  // `quality` with high or very-high precision — and reports what it finds as
  // review comments that nothing turns red. Each rule below replicates one of
  // those queries, named next to it; most of the rest are the TypeScript
  // compiler's job under `strict`. Same set as alexandria-web-application's
  // `eslint.config.mjs` (tracked as ALEXANDRIA-69 / ALEXANDRIA-70).
  {
    files: ['**/*.ts', '**/*.mjs'],
    plugins: { regexp },
    rules: {
      'no-dupe-else-if': 'error', // js/duplicate-condition
      'no-dupe-keys': 'error', // js/duplicate-property
      'no-duplicate-case': 'error', // js/duplicate-switch-case
      'use-isnan': 'error', // js/comparison-with-nan
      'no-self-assign': 'error', // js/redundant-assignment
      'no-self-compare': 'error', // js/redundant-operation
      'no-unreachable': 'error', // js/unreachable-statement
      'no-setter-return': 'error', // js/setter-return
      'no-useless-assignment': 'error', // js/useless-assignment-to-local
      'no-unused-labels': 'error', // js/label-in-switch
      'for-direction': 'error', // js/inconsistent-loop-direction
      'no-template-curly-in-string': 'error', // js/template-syntax-in-string-literal
      'no-constant-condition': 'error', // js/trivial-conditional
      'no-constant-binary-expression': 'error', // js/useless-comparison-test
      'no-empty-character-class': 'error', // js/regex/empty-character-class
      // js/regex/back-reference-before-group, js/regex/unbound-back-reference,
      // js/regex/back-reference-to-negative-lookahead
      'no-useless-backreference': 'error',
      'regexp/no-dupe-characters-character-class': 'error', // js/regex/duplicate-in-character-class
      // js/regex/unmatchable-caret, js/regex/unmatchable-dollar
      'regexp/no-useless-assertions': 'error',
      '@typescript-eslint/no-unused-expressions': 'error', // js/useless-expression
    },
  },
  prettier,
];
