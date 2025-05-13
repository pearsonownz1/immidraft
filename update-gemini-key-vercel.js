// Script to update the GEMINI_API_KEY in Vercel environment
const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Check if GEMINI_API_KEY exists in .env
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('Found GEMINI_API_KEY in .env file');

// Update the GEMINI_API_KEY in Vercel
try {
  console.log('Updating GEMINI_API_KEY in Vercel...');
  
  // First check if the variable already exists
  try {
    const checkResult = execSync('vercel env ls').toString();
    if (checkResult.includes('GEMINI_API_KEY')) {
      console.log('GEMINI_API_KEY already exists in Vercel, removing it first...');
      execSync('vercel env rm GEMINI_API_KEY --yes');
    }
  } catch (error) {
    console.warn('Could not check existing environment variables:', error.message);
  }
  
  // Add the GEMINI_API_KEY to Vercel
  console.log('Adding GEMINI_API_KEY to Vercel...');
  
  // Create a temporary file with the API key
  const tempFile = 'gemini-key-temp.txt';
  fs.writeFileSync(tempFile, process.env.GEMINI_API_KEY);
  
  // Add the environment variable to all environments (production, preview, development)
  execSync(`vercel env add GEMINI_API_KEY < ${tempFile}`);
  
  // Clean up the temporary file
  fs.unlinkSync(tempFile);
  
  console.log('GEMINI_API_KEY successfully updated in Vercel');
} catch (error) {
  console.error('Error updating GEMINI_API_KEY in Vercel:', error.message);
  process.exit(1);
}
