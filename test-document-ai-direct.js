// Test script for Document AI using direct gcloud CLI authentication
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PROJECT_ID = '602726513834';
const LOCATION = 'us';
const PROCESSOR_ID = '9e624c7085434bd9';
const SAMPLE_PDF_PATH = path.join(__dirname, 'public', 'sample-resume.pdf');

// Colors for console output
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Helper function to log with color
function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

// Get access token from gcloud CLI
function getAccessToken() {
  try {
    log('Getting access token from gcloud CLI...', YELLOW);
    const token = execSync('gcloud auth print-access-token').toString().trim();
    log('✅ Successfully obtained access token', GREEN);
    return token;
  } catch (error) {
    log(`❌ Failed to get access token: ${error.message}`, RED);
    throw error;
  }
}

// Read the sample PDF file
function readSampleFile() {
  try {
    log(`Reading sample PDF file from ${SAMPLE_PDF_PATH}...`, YELLOW);
    const fileBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
    log(`✅ Successfully read file (${fileBuffer.length} bytes)`, GREEN);
    return fileBuffer;
  } catch (error) {
    log(`❌ Failed to read sample file: ${error.message}`, RED);
    throw error;
  }
}

// Process document with Document AI
async function processDocument(accessToken, fileBuffer) {
  try {
    log('Processing document with Document AI...', YELLOW);
    
    // Prepare the request URL
    const url = `https://${LOCATION}-documentai.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}:process`;
    
    // Prepare the request body
    const requestBody = {
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: 'application/pdf'
      }
    };
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const result = await response.json();
    
    log('✅ Successfully processed document with Document AI', GREEN);
    return result;
  } catch (error) {
    log(`❌ Failed to process document: ${error.message}`, RED);
    throw error;
  }
}

// Main function
async function main() {
  log('Starting Document AI direct test...', YELLOW);
  
  try {
    // Get access token
    const accessToken = getAccessToken();
    
    // Read sample file
    const fileBuffer = readSampleFile();
    
    // Process document
    const result = await processDocument(accessToken, fileBuffer);
    
    // Extract and display text
    const extractedText = result.document.text;
    log('\nExtracted Text Preview (first 500 chars):', GREEN);
    console.log(extractedText.substring(0, 500) + '...');
    
    log('\n✅ Document AI test completed successfully!', GREEN);
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, RED);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, RED);
  process.exit(1);
});
