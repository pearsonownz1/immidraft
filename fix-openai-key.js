// This script checks and fixes the OpenAI API key format in the .env file
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

console.log('Checking OpenAI API key format...');

// Get the current OpenAI API key from the environment
const currentKey = process.env.OPENAI_API_KEY;

if (!currentKey) {
  console.error('OpenAI API key not found in environment variables.');
  process.exit(1);
}

// Check if the key has any issues
const hasQuotes = currentKey.includes('"') || currentKey.includes("'");
const hasNewlines = currentKey.includes('\n') || currentKey.includes('\r');
const hasTrailingSpaces = currentKey.trim() !== currentKey;

if (!hasQuotes && !hasNewlines && !hasTrailingSpaces) {
  console.log('OpenAI API key format looks good!');
  
  // Still update Vercel to be safe
  console.log('Updating Vercel environment variable to ensure correct format...');
} else {
  console.log('Issues found with OpenAI API key:');
  if (hasQuotes) console.log('- Contains quotes');
  if (hasNewlines) console.log('- Contains newlines');
  if (hasTrailingSpaces) console.log('- Contains trailing spaces');
  
  console.log('Fixing OpenAI API key format...');
}

// Clean the key
const cleanedKey = currentKey.trim().replace(/["']/g, '');

// Read the .env file
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error);
  process.exit(1);
}

// Replace the OpenAI API key in the .env file
const newEnvContent = envContent.replace(
  /OPENAI_API_KEY=.*/,
  `OPENAI_API_KEY=${cleanedKey}`
);

// Write the updated .env file
try {
  fs.writeFileSync(envPath, newEnvContent, 'utf8');
  console.log('.env file updated with cleaned OpenAI API key.');
} catch (error) {
  console.error('Error writing .env file:', error);
  process.exit(1);
}

// Update Vercel environment variable
import { execSync } from 'child_process';

try {
  // First try to remove the existing variable if it exists
  try {
    execSync('vercel env rm OPENAI_API_KEY production -y', { stdio: 'ignore' });
    console.log('Removed existing OPENAI_API_KEY variable from Vercel.');
  } catch (error) {
    // Ignore error if the variable doesn't exist
  }
  
  // Add OpenAI API key
  console.log('Adding new OPENAI_API_KEY variable to Vercel...');
  execSync(`echo "${cleanedKey}" | vercel env add OPENAI_API_KEY production`, { stdio: 'inherit' });
  
  console.log('\nVercel environment variable updated successfully.');
  console.log('\nNow you need to deploy your application with:');
  console.log('  vercel --prod');
  
} catch (error) {
  console.error('Error updating Vercel environment variable:', error);
  process.exit(1);
}
