import path from "node:path"; // Placeholder for missing plugin

import { defineConfig } from "vitest/config";

// import react from "@vitejs/plugin-react";
const react = (() => {}) as any;

// Based on the testing package's next config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
  },
});
