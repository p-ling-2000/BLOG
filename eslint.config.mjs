import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';

export default [
  // 1) 基本建議規則
  js.configs.recommended,

  // 2) 忽略目錄
  { ignores: ['node_modules', '.next', 'dist', 'out'] },

  // 3) 前端（瀏覽器）檔案：*.js / *.mjs（排除 api 目錄）
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['api/**'],
    languageOptions: {
      globals: { ...globals.browser },
      sourceType: 'module',
    },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // 4) 後端（API）為 ESM：api/**/*.js / api/**/*.mjs
  {
    files: ['api/**/*.js', 'api/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
    },
  },

  // 5) 只有 .cjs 才視為 CommonJS（如果你還有 .cjs 檔）
  {
    files: ['**/*.cjs', 'api/**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-console': 'off',
    },
  },

  // 6) 關閉與 Prettier 衝突的規則
  eslintConfigPrettier,
];
