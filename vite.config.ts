import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import nodePolyfillFix from "./vite-plugin-node-polyfill-fix";

// Check if the Node.js polyfill fix is enabled
const useNodePolyfillFix = process.env.USE_NODE_POLYFILL_FIX === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    // Exclude Node.js built-ins from being bundled
    exclude: ['fs', 'path', 'os', 'crypto', 'stream', 'util'],
  },
  plugins: [
    react(),
    tempo(),
    // Only use the Node.js polyfill fix if enabled
    ...(useNodePolyfillFix ? [nodePolyfillFix()] : []),
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
