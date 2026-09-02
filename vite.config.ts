import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "es2022", sourcemap: false },
  server: {
    port: 4173,
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
});
