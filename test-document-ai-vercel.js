// Test Document AI integration with Vercel deployment
import fetch from 'node-fetch';

// Configuration
const VERCEL_URL = 'https://immidraft-3gc4t5faq-guy-gcsorgs-projects.vercel.app';
const SAMPLE_DOCUMENT_URL = `${VERCEL_URL}/sample-resume.pdf`;
const API_ENDPOINT = `${VERCEL_URL}/api/process-document`;

console.log('Testing Document AI integration with Vercel deployment');
console.log('--------------------------------------------------');
console.log(`Vercel URL: ${VERCEL_URL}`);
console.log(`Sample Document URL: ${SAMPLE_DOCUMENT_URL}`);
console.log(`API Endpoint: ${API_ENDPOINT}`);
console.log('--------------------------------------------------');

async function testDocumentAI() {
  try {
    console.log('Sending request to process document...');
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: SAMPLE_DOCUMENT_URL,
        documentType: 'resume',
        documentName: 'Sample Resume'
      }),
    });
    
    // Get the raw text response first
    const responseText = await response.text();
    
    // Check if the response is HTML (authentication page)
    if (responseText.includes('<!doctype html>') || responseText.includes('<html')) {
      console.error('Received HTML response instead of JSON. Authentication may be required.');
      console.log('First 200 characters of response:');
      console.log(responseText.substring(0, 200) + '...');
      return;
    }
    
    // Parse as JSON if it's not HTML
    const responseData = JSON.parse(responseText);
    
    if (!response.ok) {
      console.error('Error processing document:', responseData);
      return;
    }
    
    console.log('Document processed successfully!');
    console.log('--------------------------------------------------');
    console.log('Summary:', responseData.summary);
    console.log('--------------------------------------------------');
    console.log('Tags:', responseData.tags.join(', '));
    console.log('--------------------------------------------------');
    console.log('First 500 characters of extracted text:');
    console.log(responseData.extractedText.substring(0, 500) + '...');
  } catch (error) {
    console.error('Error testing Document AI:', error);
  }
}

// Run the test
testDocumentAI();
