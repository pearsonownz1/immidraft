// Test script for Cloud Run Document AI API with WIF authentication
import fetch from 'node-fetch';

const API_URL = 'https://document-ai-api-prbaboamfq-uc.a.run.app/process-document';
const DOCUMENT_URL = 'https://immidraft-y94n6nubq-guy-gcsorgs-projects.vercel.app/sample-resume.pdf';

async function testCloudRunApiWithWif() {
  console.log('Testing Cloud Run Document AI API with WIF authentication...');
  console.log(`Document URL: ${DOCUMENT_URL}`);
  console.log(`API URL: ${API_URL}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: DOCUMENT_URL,
        documentName: 'Sample Resume',
        documentType: 'resume',
      }),
    });

    console.log(`Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response text: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response parsed as JSON successfully');
      
      if (responseJson.success) {
        console.log('✅ API call successful!');
        console.log(`Document name: ${responseJson.documentName}`);
        console.log(`Document type: ${responseJson.documentType}`);
        console.log(`Summary: ${responseJson.summary}`);
        console.log(`Tags: ${responseJson.tags.join(', ')}`);
        console.log(`Extracted text length: ${responseJson.extractedText.length} characters`);
        console.log(`First 200 characters of extracted text: ${responseJson.extractedText.substring(0, 200)}...`);
      } else {
        console.log('❌ API call failed with error:');
        console.log(responseJson.error);
        if (responseJson.message) {
          console.log(`Message: ${responseJson.message}`);
        }
        if (responseJson.details) {
          console.log(`Details: ${JSON.stringify(responseJson.details)}`);
        }
      }
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError);
      console.log('Raw response:', responseText);
    }
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

testCloudRunApiWithWif();
