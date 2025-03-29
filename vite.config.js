import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    minify: "terser",
    sourcemap: false,
    // Configure chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "i18n-vendor": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
            "i18next-http-backend",
          ],
          "icons-vendor": ["react-icons"],
        },
      },
    },
    // Optimize images on build
    assetsInlineLimit: 4096, // 4kb
  },
  // Configure environment variables
  envPrefix: "APP_",
});
