/**
 * Vite plugin to fix Node.js polyfill issues in browser environments
 * This plugin replaces Node.js built-in modules with empty implementations
 * to prevent errors like "readFileSync is not a function"
 */

export default function nodePolyfillFix() {
  const nodeBuiltins = [
    'fs',
    'path',
    'os',
    'crypto',
    'stream',
    'util',
    'assert',
    'buffer',
    'events',
    'querystring',
    'string_decoder',
    'url',
    'zlib'
  ];

  return {
    name: 'vite-plugin-node-polyfill-fix',
    
    // This hook runs when a module is resolved
    resolveId(id) {
      // If the import is a Node.js built-in module, return a virtual module ID
      if (nodeBuiltins.includes(id)) {
        return `\0virtual:${id}`;
      }
      return null;
    },
    
    // This hook runs when a module is loaded
    load(id) {
      // If this is one of our virtual modules, return an empty implementation
      if (id.startsWith('\0virtual:')) {
        const moduleName = id.slice(9); // Remove '\0virtual:' prefix
        
        console.log(`Replacing Node.js module "${moduleName}" with empty implementation`);
        
        // Return an empty implementation for the module
        return `
          console.warn('Node.js module "${moduleName}" is not available in browser environments');
          export default {};
          export const readFileSync = () => { 
            throw new Error('readFileSync is not available in browser environments'); 
          };
          export const writeFileSync = () => { 
            throw new Error('writeFileSync is not available in browser environments'); 
          };
          export const existsSync = () => false;
          export const readdirSync = () => [];
          export const statSync = () => ({
            isDirectory: () => false,
            isFile: () => false
          });
        `;
      }
      return null;
    }
  };
}
