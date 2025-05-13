// Test script for the document processing API proxy
// This script tests the Vercel serverless function that forwards requests to the Cloud Run API

import fetch from 'node-fetch';

// URL of the document to process (sample resume PDF)
const documentUrl = 'https://immidraft-y94n6nubq-guy-gcsorgs-projects.vercel.app/sample-resume.pdf';

// URL of the Vercel API endpoint
const apiUrl = 'https://immidraft-y94n6nubq-guy-gcsorgs-projects.vercel.app/api/process-document';

async function testDocumentProcessing() {
  console.log('Testing document processing API proxy...');
  console.log(`Document URL: ${documentUrl}`);
  console.log(`API URL: ${apiUrl}`);
  
  try {
    // Make a request to the API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl,
        documentType: 'pdf',
        documentName: 'Sample Resume',
      }),
    });
    
    // Get the response text
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText.substring(0, 500) + '...');
    
    // Try to parse the response as JSON if it's valid
    try {
      const data = JSON.parse(responseText);
      
      // Check if the response is successful
      if (response.ok) {
        console.log('Document processing successful!');
        console.log('Summary:', data.summary);
        console.log('Tags:', data.tags);
        console.log('Extracted text length:', data.extractedText?.length || 0);
      } else {
        console.error('Document processing failed:', data.error);
        console.error('Message:', data.message);
      }
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError.message);
    }
  } catch (error) {
    console.error('Error testing document processing API:', error);
  }
}

// Run the test
testDocumentProcessing();
