#!/usr/bin/env node

/**
 * This script runs the DocumentSortingDemo page to showcase the document sorting functionality.
 * 
 * Usage:
 * 1. Make this script executable: chmod +x run-demo.js
 * 2. Run the script: ./run-demo.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in a React project
if (!fs.existsSync('package.json')) {
  console.error('Error: This script must be run from the root of your React project.');
  process.exit(1);
}

// Read package.json to check if it's a React project
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.dependencies || (!packageJson.dependencies.react && !packageJson.devDependencies?.react)) {
  console.error('Error: This does not appear to be a React project (react not found in dependencies).');
  process.exit(1);
}

// Create a temporary App.tsx file that renders the DocumentSortingDemo
const tempAppPath = path.join('src', 'App.tsx.temp');
const originalAppPath = path.join('src', 'App.tsx');
const hasOriginalApp = fs.existsSync(originalAppPath);

// Backup the original App.tsx if it exists
if (hasOriginalApp) {
  console.log('Backing up original App.tsx...');
  fs.copyFileSync(originalAppPath, `${originalAppPath}.backup`);
}

// Create a temporary App.tsx that imports and renders the DocumentSortingDemo
console.log('Creating temporary App.tsx with DocumentSortingDemo...');
const tempAppContent = `import React from 'react';
import { DocumentSortingDemo } from './components/document-sorting';

function App() {
  return (
    <div className="App">
      <DocumentSortingDemo />
    </div>
  );
}

export default App;
`;

fs.writeFileSync(originalAppPath, tempAppContent);

// Run the development server
console.log('Starting development server...');
console.log('Press Ctrl+C to stop the server and restore the original App.tsx');

try {
  // Determine which command to run based on the package.json scripts
  let startCommand = 'npm start';
  if (packageJson.scripts) {
    if (packageJson.scripts.dev) {
      startCommand = 'npm run dev';
    } else if (packageJson.scripts.serve) {
      startCommand = 'npm run serve';
    }
  }
  
  // Run the development server
  execSync(startCommand, { stdio: 'inherit' });
} catch (error) {
  // This will be reached when the user presses Ctrl+C
  console.log('\nStopping server...');
} finally {
  // Restore the original App.tsx
  if (hasOriginalApp) {
    console.log('Restoring original App.tsx...');
    fs.copyFileSync(`${originalAppPath}.backup`, originalAppPath);
    fs.unlinkSync(`${originalAppPath}.backup`);
  } else {
    // If there was no original App.tsx, remove the temporary one
    fs.unlinkSync(originalAppPath);
  }
  
  console.log('Done! Original files restored.');
}
