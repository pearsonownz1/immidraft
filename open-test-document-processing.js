// Script to open the test-document-processing.html file in a browser
// Using ES modules instead of CommonJS

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the path to the test-document-processing.html file
const htmlFilePath = path.join(__dirname, 'public', 'test-document-processing.html');

// Determine the command to open the file based on the operating system
let command;
switch (os.platform()) {
  case 'darwin': // macOS
    command = `open "${htmlFilePath}"`;
    break;
  case 'win32': // Windows
    command = `start "" "${htmlFilePath}"`;
    break;
  default: // Linux and others
    command = `xdg-open "${htmlFilePath}"`;
    break;
}

console.log(`Opening ${htmlFilePath} in your default browser...`);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error opening file: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Browser opened successfully.`);
});
