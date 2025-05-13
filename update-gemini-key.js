// This script updates the .env file and Vercel environment variables with Google Gemini API key
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import 'dotenv/config';

const GEMINI_API_KEY = 'AIzaSyDtaP1NQ0DlI0rvcsbgHdONV4gMBen8icM';

console.log('Updating .env file with Google Gemini API key...');

// Read the .env file
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error);
  process.exit(1);
}

// Check if GEMINI_API_KEY already exists in .env
if (envContent.includes('GEMINI_API_KEY=')) {
  // Replace existing GEMINI_API_KEY
  const newEnvContent = envContent.replace(
    /GEMINI_API_KEY=.*/,
    `GEMINI_API_KEY=${GEMINI_API_KEY}`
  );
  
  // Write the updated .env file
  try {
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    console.log('Updated existing GEMINI_API_KEY in .env file.');
  } catch (error) {
    console.error('Error writing .env file:', error);
    process.exit(1);
  }
} else {
  // Add GEMINI_API_KEY to .env
  const newEnvContent = envContent + `\nGEMINI_API_KEY=${GEMINI_API_KEY}\n`;
  
  // Write the updated .env file
  try {
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    console.log('Added GEMINI_API_KEY to .env file.');
  } catch (error) {
    console.error('Error writing .env file:', error);
    process.exit(1);
  }
}

// Update Vercel environment variable
try {
  // First try to remove the existing variable if it exists
  try {
    execSync('vercel env rm GEMINI_API_KEY production -y', { stdio: 'ignore' });
    console.log('Removed existing GEMINI_API_KEY variable from Vercel.');
  } catch (error) {
    // Ignore error if the variable doesn't exist
  }
  
  // Add Gemini API key
  console.log('Adding GEMINI_API_KEY variable to Vercel...');
  execSync(`echo "${GEMINI_API_KEY}" | vercel env add GEMINI_API_KEY production`, { stdio: 'inherit' });
  
  console.log('\nVercel environment variable updated successfully.');
  console.log('\nNow you need to deploy your application with:');
  console.log('  vercel --prod');
  
} catch (error) {
  console.error('Error updating Vercel environment variable:', error);
  process.exit(1);
}
