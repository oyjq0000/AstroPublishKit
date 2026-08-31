import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

const runtimeGlobals = {
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  localStorage: "readonly",
  matchMedia: "readonly",
  process: "readonly",
  Response: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  window: "readonly"
};

export default [
  {
    ignores: [".astro/**", "dist/**", "node_modules/**", "public/pagefind/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,ts,astro}"],
    languageOptions: { globals: runtimeGlobals }
  },
  {
    files: ["**/*.astro"],
    rules: {
      "no-undef": "off"
    }
  }
];
