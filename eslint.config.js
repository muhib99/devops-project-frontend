import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        console: "readonly",
        parseInt: "readonly",
        marked: "readonly",
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    }
  }
];