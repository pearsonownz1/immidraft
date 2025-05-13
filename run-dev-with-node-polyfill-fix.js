/**
 * Script to run the development server with the Node.js polyfill fix
 * This script sets an environment variable to enable the custom Vite plugin
 */

import { exec } from 'child_process';

// Set environment variable to enable the Node.js polyfill fix
process.env.USE_NODE_POLYFILL_FIX = 'true';

console.log('Starting development server with Node.js polyfill fix...');

// Run the development server
const devProcess = exec('npm run dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Forward stdout and stderr to the console
devProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

devProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Handle process exit
devProcess.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
});
