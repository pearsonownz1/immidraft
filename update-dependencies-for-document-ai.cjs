#!/usr/bin/env node

/**
 * Script to update package.json with dependencies required for Document AI integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Read package.json
console.log('Reading package.json...');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Dependencies to add or update
const dependencies = {
  '@google-cloud/documentai': '^8.1.0',
  'dotenv': '16.5.0',
  'node-fetch': '^3.3.2',
  'openai': '4.97.0'
};

// Check if dependencies already exist
let dependenciesChanged = false;
for (const [name, version] of Object.entries(dependencies)) {
  if (!packageJson.dependencies[name] || packageJson.dependencies[name] !== version) {
    console.log(`Adding/updating dependency: ${name}@${version}`);
    packageJson.dependencies[name] = version;
    dependenciesChanged = true;
  } else {
    console.log(`Dependency already exists: ${name}@${version}`);
  }
}

// Save package.json if changes were made
if (dependenciesChanged) {
  console.log('Saving updated package.json...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  // Install dependencies
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    console.log('Please run "npm install" manually to install the dependencies.');
  }
} else {
  console.log('No changes needed to package.json.');
}

// Add scripts if they don't exist
let scriptsChanged = false;

if (!packageJson.scripts['test:document-ai']) {
  console.log('Adding test:document-ai script...');
  packageJson.scripts['test:document-ai'] = 'node test-document-ai-integration.js';
  scriptsChanged = true;
}

// Save package.json if scripts were added
if (scriptsChanged) {
  console.log('Saving updated package.json with new scripts...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

console.log('Document AI dependencies setup complete!');
console.log('\nNext steps:');
console.log('1. Run "./setup-document-ai-integration.sh" to set up the Google Cloud access token');
console.log('2. Update the .env.document-ai file with your OpenAI API key');
console.log('3. Run "npm run test:document-ai" to test the Document AI integration');
