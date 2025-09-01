// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1",
        changeOrigin: true,
        // IMPORTANT: NU rescrie /api
        // NU mai pune rewrite aici
      },
      // pentru flow-ul OAuth fără prefix
      "/oauth2":       { target: "http://127.0.0.1", changeOrigin: true },
      "/login/oauth2": { target: "http://127.0.0.1", changeOrigin: true },
    },
  },
  plugins: [react()],
});
