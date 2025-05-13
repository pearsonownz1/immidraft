// Test script for the Vercel API endpoint with Workload Identity Federation
import fetch from 'node-fetch';

// Configuration
const VERCEL_API_URL = 'https://immidraft-idfv46a46-guy-gcsorgs-projects.vercel.app/api/process-document';
const DOCUMENT_URL = 'https://storage.googleapis.com/cloud-samples-data/documentai/invoice.pdf';

async function testVercelApiWithWIF() {
  console.log('Testing Vercel API endpoint with Workload Identity Federation...');
  console.log(`API URL: ${VERCEL_API_URL}`);
  console.log(`Document URL: ${DOCUMENT_URL}`);
  
  try {
    // Make the request to the Vercel API endpoint
    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: DOCUMENT_URL,
        documentName: 'Sample Invoice',
        documentType: 'invoice'
      }),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      return;
    }
    
    // Parse the response
    const data = await response.json();
    
    // Log the results
    console.log('Success! Document processed successfully.');
    console.log('Summary:', data.summary);
    console.log('Tags:', data.tags);
    console.log('Extracted Text (first 200 chars):', data.extractedText.substring(0, 200) + '...');
  } catch (error) {
    console.error('Error testing Vercel API endpoint:', error);
  }
}

// Run the test
testVercelApiWithWIF();
