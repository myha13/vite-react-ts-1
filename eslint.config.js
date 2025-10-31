import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Base JavaScript rules
  js.configs.recommended,

  // Ignore files
  {
    ignores: ["dist/", "node_modules/"],
  },

  // Configuration for TypeScript and React files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "react/prop-types": "off", // Disable if using TypeScript
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
