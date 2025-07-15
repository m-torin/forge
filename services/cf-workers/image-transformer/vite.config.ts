import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
});
