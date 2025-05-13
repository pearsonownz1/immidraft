// Test Document AI integration locally
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.document-ai
dotenv.config({ path: '.env.document-ai' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '602726513834';
const LOCATION = 'us';
const PROCESSOR_ID = process.env.DOCUMENT_AI_PROCESSOR_ID || '9e624c7085434bd9';
const SAMPLE_PDF_PATH = path.join(__dirname, 'public', 'sample-resume.pdf');

console.log('Testing Google Cloud Document AI integration locally');
console.log('--------------------------------------------------');
console.log('Environment variables:');
console.log(`- GOOGLE_CLOUD_PROJECT_ID: ${PROJECT_ID}`);
console.log(`- DOCUMENT_AI_PROCESSOR_ID: ${PROCESSOR_ID}`);
console.log(`- Sample PDF path: ${SAMPLE_PDF_PATH}`);
console.log('--------------------------------------------------');

// Function to get credentials
function getCredentials() {
  // Try service account credentials first
  const serviceAccountPath = path.join(__dirname, 'document-ai-service-account-key.json');
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Using service account credentials');
    try {
      return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } catch (error) {
      console.error('Error parsing service account credentials:', error);
    }
  }
  
  // Fall back to WIF credentials
  const wifCredentialsPath = path.join(__dirname, 'vercel-wif-credentials.json');
  if (fs.existsSync(wifCredentialsPath)) {
    console.log('Using Workload Identity Federation credentials');
    try {
      return JSON.parse(fs.readFileSync(wifCredentialsPath, 'utf8'));
    } catch (error) {
      console.error('Error parsing WIF credentials:', error);
    }
  }
  
  console.log('No credentials file found, using application default credentials');
  return null;
}

async function testDocumentAI() {
  try {
    console.log('Initializing Document AI client...');
    
    // Initialize Document AI client using application default credentials
    const documentAiClient = new DocumentProcessorServiceClient();
    
    console.log('Document AI client initialized successfully');
    
    // Check if sample PDF exists
    if (!fs.existsSync(SAMPLE_PDF_PATH)) {
      console.error(`Sample PDF not found at path: ${SAMPLE_PDF_PATH}`);
      return;
    }
    
    // Read the PDF file
    const documentBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
    
    // Prepare the request
    const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
    
    // Convert buffer to base64
    const encodedDocument = documentBuffer.toString('base64');
    
    // Create the request
    const request = {
      name,
      rawDocument: {
        content: encodedDocument,
        mimeType: 'application/pdf',
      }
    };
    
    console.log('Sending document to Document AI for processing...');
    
    // Process the document
    const [result] = await documentAiClient.processDocument(request);
    
    if (!result.document || !result.document.text) {
      console.error('Document AI response missing expected text field');
      return;
    }
    
    // Extract text from the document
    const extractedText = result.document.text;
    
    console.log('Document processed successfully!');
    console.log('--------------------------------------------------');
    console.log('First 500 characters of extracted text:');
    console.log(extractedText.substring(0, 500) + '...');
    
    return extractedText;
  } catch (error) {
    console.error('Error processing document with Document AI:', error);
  }
}

// Run the test
testDocumentAI();
