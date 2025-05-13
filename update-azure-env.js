// This script updates the Vercel environment variables for Azure Document Intelligence
import 'dotenv/config';
import { execSync } from 'child_process';

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Vercel CLI is not installed. Please install it with: npm i -g vercel');
  process.exit(1);
}

// Get Azure Document Intelligence credentials from .env file
const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const azureKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
const azureRegion = process.env.AZURE_DOCUMENT_INTELLIGENCE_REGION;

if (!azureEndpoint || !azureKey) {
  console.error('Missing Azure Document Intelligence credentials. Check your .env file.');
  process.exit(1);
}

console.log('Updating Vercel environment variables with Azure Document Intelligence credentials...');

// Update Vercel environment variables
try {
  // First try to remove the existing variables if they exist
  try {
    execSync('vercel env rm AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT production -y', { stdio: 'ignore' });
    console.log('Removed existing AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT variable.');
  } catch (error) {
    // Ignore error if the variable doesn't exist
  }
  
  try {
    execSync('vercel env rm AZURE_DOCUMENT_INTELLIGENCE_KEY production -y', { stdio: 'ignore' });
    console.log('Removed existing AZURE_DOCUMENT_INTELLIGENCE_KEY variable.');
  } catch (error) {
    // Ignore error if the variable doesn't exist
  }
  
  if (azureRegion) {
    try {
      execSync('vercel env rm AZURE_DOCUMENT_INTELLIGENCE_REGION production -y', { stdio: 'ignore' });
      console.log('Removed existing AZURE_DOCUMENT_INTELLIGENCE_REGION variable.');
    } catch (error) {
      // Ignore error if the variable doesn't exist
    }
  }
  
  // Add Azure Document Intelligence endpoint
  console.log('Adding new AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT variable...');
  execSync(`echo "${azureEndpoint}" | vercel env add AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT production`, { stdio: 'inherit' });
  
  // Add Azure Document Intelligence key
  console.log('Adding new AZURE_DOCUMENT_INTELLIGENCE_KEY variable...');
  execSync(`echo "${azureKey}" | vercel env add AZURE_DOCUMENT_INTELLIGENCE_KEY production`, { stdio: 'inherit' });
  
  // Add Azure Document Intelligence region if available
  if (azureRegion) {
    console.log('Adding new AZURE_DOCUMENT_INTELLIGENCE_REGION variable...');
    execSync(`echo "${azureRegion}" | vercel env add AZURE_DOCUMENT_INTELLIGENCE_REGION production`, { stdio: 'inherit' });
  }
  
  console.log('\nVercel environment variables updated successfully.');
  console.log('\nNow you need to deploy your application with:');
  console.log('  vercel --prod');
  
} catch (error) {
  console.error('Error updating Vercel environment variables:', error);
  process.exit(1);
}
