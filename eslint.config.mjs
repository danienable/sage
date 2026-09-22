import js from "@eslint/js";
import htmlEslint from "@html-eslint/eslint-plugin";
import htmlParser from "@html-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/", "dist/"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        Ember: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    ...htmlEslint.configs["flat/recommended"],
    files: ["**/*.html"],
    plugins: {
      "@html-eslint": htmlEslint,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...htmlEslint.configs["flat/recommended"].rules,
      "@html-eslint/require-doctype": "off",
      "@html-eslint/require-lang": "off",
      "@html-eslint/require-title": "off",
      "@html-eslint/indent": ["error", 2],
    },
  },
];
