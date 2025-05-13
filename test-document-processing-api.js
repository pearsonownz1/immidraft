// Test script to check if the document processing API is working correctly
import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:8080/process-document'; // Local API server
// const API_URL = 'https://immidraft.vercel.app/api/process-document'; // Production API

// Sample document URL (public URL to a PDF)
const SAMPLE_DOC_URL = 'https://immidraft.vercel.app/sample-resume.pdf';

async function testDocumentProcessingAPI() {
  console.log('Testing document processing API...');
  console.log(`API URL: ${API_URL}`);
  console.log(`Sample document: ${SAMPLE_DOC_URL}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: SAMPLE_DOC_URL,
        documentName: 'sample-resume.pdf',
        documentType: 'resume'
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log('Success:', data.success);
    console.log('Document Name:', data.documentName);
    console.log('Document Type:', data.documentType);
    
    // Check if summary is present
    if (data.summary) {
      console.log('\nSummary is present ✅');
      console.log('Summary length:', data.summary.length);
      console.log('Summary preview:', data.summary.substring(0, 100) + '...');
    } else {
      console.log('\nSummary is missing ❌');
    }
    
    // Check if tags are present
    if (data.ai_tags || data.tags) {
      const tags = data.ai_tags || data.tags;
      console.log('\nTags are present ✅');
      console.log('Tags:', tags);
    } else {
      console.log('\nTags are missing ❌');
    }
    
    // Check if extracted text is present
    if (data.extracted_text || data.extractedText) {
      const text = data.extracted_text || data.extractedText;
      console.log('\nExtracted text is present ✅');
      console.log('Text length:', text.length);
      console.log('Text preview:', text.substring(0, 100) + '...');
    } else {
      console.log('\nExtracted text is missing ❌');
    }
    
    // Check for error messages
    if (data.error) {
      console.log('\nError message:', data.error);
    }
    
    console.log('\nFull response data:');
    console.log(JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing document processing API:', error);
    return null;
  }
}

// Run the test
testDocumentProcessingAPI();
