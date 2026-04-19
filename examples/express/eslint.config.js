import { defineConfig } from "eslint/config";
import {
  basePreset,
  bestPracticePreset,
  importPreset,
  nodePreset,
} from "@msobiecki/eslint-config";

export default defineConfig([
  basePreset,
  bestPracticePreset,
  importPreset,
  nodePreset,
  {
    rules: {
      "security/detect-object-injection": "off",
      "unicorn/no-null": "off",
    },
  },
  {
    files: ["./lib/index.js"],
    rules: {
      "no-console": "off",
      "unicorn/no-process-exit": "off",
      "n/no-process-exit": "off",
    },
  },
]);
