// This script updates the Vercel environment variable for OpenAI API key
import 'dotenv/config';
import { execSync } from 'child_process';

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Vercel CLI is not installed. Please install it with: npm i -g vercel');
  process.exit(1);
}

// Get OpenAI API key from .env file
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('Missing OpenAI API key. Check your .env file.');
  process.exit(1);
}

console.log('Updating Vercel environment variable with OpenAI API key...');

// Update Vercel environment variable
try {
  // First try to remove the existing variable if it exists
  try {
    execSync('vercel env rm OPENAI_API_KEY production -y', { stdio: 'ignore' });
    console.log('Removed existing OPENAI_API_KEY variable.');
  } catch (error) {
    // Ignore error if the variable doesn't exist
  }
  
  // Add OpenAI API key
  console.log('Adding new OPENAI_API_KEY variable...');
  execSync(`echo "${openaiApiKey}" | vercel env add OPENAI_API_KEY production`, { stdio: 'inherit' });
  
  console.log('\nVercel environment variable updated successfully.');
  console.log('\nNow you need to deploy your application with:');
  console.log('  vercel --prod');
  
} catch (error) {
  console.error('Error updating Vercel environment variable:', error);
  process.exit(1);
}
