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
  // Type-aware rules. The project service gives each file the program of the
  // nearest tsconfig.json; the files no tsconfig includes (the .mjs scripts —
  // tsconfig.json has no allowJs — and vitest.config.ts) get the default
  // project instead, so they are linted with types too.
  {
    files: ['**/*.ts', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', 'vitest.config.ts', 'build/*.mjs', 'scripts/*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // js/missing-await — a promise used where its value was meant: as a
      // condition (`if (isAllowed())` on an async predicate is always true) or
      // spread into an object. That is what `checksConditionals` and
      // `checksSpreads` cover (ALEXANDRIA-85).
      //
      // `checksVoidReturn` is off, as in alexandria-web-application. It reports
      // an async function handed to something that ignores what it returns (a
      // JSX handler, a timer, a listener), and the fix it asks for — wrapping
      // it in `void` — handles no error. Whether a rejection reaches anyone is
      // `no-floating-promises`' question, not this rule's.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksConditionals: true, checksSpreads: true, checksVoidReturn: false },
      ],
    },
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
