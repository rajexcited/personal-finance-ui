/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // root: "public",
  base: process.env.PUBLIC_URL,
  build: {
    outDir: "build" // Optional: Match CRA's default output directory
  },
  test: {
    globals: true
  }
});
