import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import { Buffer } from 'buffer';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8080';
const SAMPLE_PDF_PATH = '../public/sample-resume.pdf';

/**
 * Test the document processing API
 */
async function testDocumentProcessingAPI() {
  try {
    console.log('Testing document processing API...');
    console.log(`API URL: ${API_URL}`);
    
    // Check if the API is running
    console.log('\nTesting health check endpoint...');
    const healthResponse = await fetch(`${API_URL}/`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.statusText}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('Health check response:', JSON.stringify(healthData, null, 2));
    
    // Check if the sample PDF exists
    const pdfPath = path.resolve(__dirname, SAMPLE_PDF_PATH);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Sample PDF not found at ${pdfPath}`);
    }
    
    console.log(`\nUsing sample PDF: ${pdfPath}`);
    
    // Read the file content and encode as base64
    const fileContent = fs.readFileSync(pdfPath);
    const base64Content = fileContent.toString('base64');
    
    // Create a data URL for testing
    const dataUrl = `data:application/pdf;base64,${base64Content}`;
    
    console.log(`\nTesting document processing endpoint...`);
    console.log(`Using data URL (base64 encoded PDF)`);
    
    // Process the document using the data URL
    const processResponse = await fetch(`${API_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: dataUrl,
        documentName: 'sample-resume.pdf',
        documentType: 'pdf',
      }),
    });
    
    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`Document processing failed: ${processResponse.statusText}\n${errorText}`);
    }
    
    const processData = await processResponse.json();
    
    console.log('\nDocument processing response:');
    console.log('Success:', processData.success);
    console.log('Document Name:', processData.documentName);
    console.log('Document Type:', processData.documentType);
    console.log('Summary:', processData.summary);
    console.log('Tags:', processData.tags);
    console.log('Extracted Text (first 200 chars):', processData.extractedText?.substring(0, 200) + '...');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDocumentProcessingAPI();
