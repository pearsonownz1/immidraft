/**
 * Type declarations for vite-plugin-node-polyfill-fix
 */

declare module './vite-plugin-node-polyfill-fix' {
  /**
   * Vite plugin to fix Node.js polyfill issues in browser environments
   * This plugin replaces Node.js built-in modules with empty implementations
   * to prevent errors like "readFileSync is not a function"
   */
  export default function nodePolyfillFix(): {
    name: string;
    resolveId(id: string): string | null;
    load(id: string): string | null;
  };
}
