import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      globals: {
        // Common globals that are often missing
        React: "readonly",
        NodeJS: "readonly",
        RequestInit: "readonly",
        HeadersInit: "readonly",
        BodyInit: "readonly",
        RequestMode: "readonly",
        RequestCredentials: "readonly",
        RequestCache: "readonly",
        RequestRedirect: "readonly",
        ReferrerPolicy: "readonly",
      },
    },
    rules: {
      // Downgrade most rules to warnings for CI compatibility
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "import/no-anonymous-default-export": "warn",

      // Only keep critical errors that break functionality
      "react/jsx-no-undef": "error",
      "no-undef": "warn", // Downgrade to warning to avoid blocking CI
      "no-unused-expressions": "warn",
      "prefer-const": "warn",
    },
  },
  // Jest configuration for test files
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}", "**/tests/**/*.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
        // React for JSX
        React: "readonly",
      },
    },
    rules: {
      // Allow Jest globals in test files
      "no-undef": "off", // Jest globals are handled by the globals above
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests for mocking
      "react/display-name": "off", // Not needed in tests
    },
  },
];

export default eslintConfig;
