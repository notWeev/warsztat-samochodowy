import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: { usePolling: true },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "mui-core": ["@mui/material", "@mui/icons-material"],
          "mui-x": ["@mui/x-data-grid", "@mui/x-date-pickers"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
