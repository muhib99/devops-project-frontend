const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser,
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
    }
  }
];