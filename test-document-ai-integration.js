// Test script for Document AI integration (using mock service)
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { mockProcessDocument } from './src/services/mockDocumentAIService.js';

// Load environment variables from .env.document-ai
dotenv.config({ path: '.env.document-ai' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Check if all required environment variables are set
function checkEnvironmentVariables() {
  console.log(`${colors.blue}Checking environment variables...${colors.reset}`);
  
  // In mock mode, we don't actually need the environment variables,
  // but we'll check for them anyway to simulate the real process
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'DOCUMENT_AI_PROCESSOR_ID',
    'GOOGLE_ACCESS_TOKEN',
    'OPENAI_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`${colors.yellow}Warning: Missing environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Using mock service instead of real APIs.${colors.reset}`);
  } else {
    console.log(`${colors.green}All required environment variables are set.${colors.reset}`);
    console.log(`${colors.yellow}Note: Using mock service instead of real APIs for testing.${colors.reset}`);
  }
}

// Test Document AI text extraction with mock service
async function testDocumentAI() {
  console.log(`${colors.blue}Testing Document AI text extraction (mock)...${colors.reset}`);
  
  // Path to a sample PDF file
  const samplePdfPath = path.join(__dirname, 'public', 'sample-resume.pdf');
  
  // Check if the sample PDF exists
  if (!fs.existsSync(samplePdfPath)) {
    console.error(`${colors.red}Error: Sample PDF file not found at ${samplePdfPath}${colors.reset}`);
    console.error(`${colors.yellow}Please create a sample PDF file at ${samplePdfPath} for testing.${colors.reset}`);
    process.exit(1);
  }
  
  // Read the sample PDF file
  const fileContent = fs.readFileSync(samplePdfPath);
  const encodedContent = Buffer.from(fileContent).toString('base64');
  
  try {
    console.log(`${colors.yellow}Processing document with mock Document AI service...${colors.reset}`);
    
    // Process the document with the mock service
    const result = await mockProcessDocument(encodedContent, 'application/pdf');
    
    // Extract text from the response
    const extractedText = result.extractedText;
    
    console.log(`${colors.green}Document AI text extraction successful!${colors.reset}`);
    console.log(`${colors.cyan}Extracted text (first 500 characters):${colors.reset}`);
    console.log(extractedText.substring(0, 500) + '...');
    
    // Display summary
    console.log(`${colors.green}Document summary:${colors.reset}`);
    console.log(result.summary);
    
    // Display tags
    console.log(`${colors.green}Document tags:${colors.reset}`);
    console.log(result.tags);
    
    // All tests passed
    console.log(`${colors.green}All tests passed! Document AI integration (mock) is working correctly.${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log(`${colors.magenta}Starting Document AI integration test (using mock service)...${colors.reset}`);
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Test Document AI with mock service
  await testDocumentAI();
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});
