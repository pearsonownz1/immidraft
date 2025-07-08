import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
    // Exclude Node.js built-ins from being bundled
    exclude: ['fs', 'path', 'os', 'crypto', 'stream', 'util'],
  },
  plugins: [
    react(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Prevent Node.js globals from being polyfilled in browser
    'process.env': {},
    'global': {},
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
