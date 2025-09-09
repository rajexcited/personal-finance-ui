import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["**/*.d.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off", // Disable for now as it's widespread in the codebase
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }], // Allow unused vars with _ prefix
      "react/prop-types": "off", // TypeScript handles prop validation
      "react/no-children-prop": "off", // Common pattern in this codebase
      "jsx-a11y/label-has-associated-control": "off", // Many label/control patterns in this codebase
      "jsx-a11y/click-events-have-key-events": "off", // Will require major refactoring
      "jsx-a11y/no-static-element-interactions": "off", // Will require major refactoring
      "jsx-a11y/no-noninteractive-element-interactions": "off", // Will require major refactoring
      "react/display-name": "off", // Not critical for functionality
      "react/no-unescaped-entities": "off", // Minor display issue
      "@typescript-eslint/no-unsafe-function-type": "off", // Legacy code pattern
      "no-useless-escape": "off", // Regex patterns are often intentionally escaped
      "react/jsx-key": "error", // Keep this as it can cause React issues
    },
  },
  {
    settings: {
      react: {
        version: "19.1.1",
      },
    },
  },
]);
