import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAzureDocumentIntelligence() {
  try {
    // Read the PDF file
    const pdfPath = path.resolve(__dirname, '../public/sample-resume.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    const dataUrl = 'data:application/pdf;base64,' + base64Pdf;
    
    console.log('Sending PDF document to API...');
    
    // Send the document to the API
    const response = await fetch('http://localhost:8080/process-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentUrl: dataUrl,
        documentName: 'sample-resume.pdf',
        documentType: 'pdf'
      })
    });
    
    const result = await response.json();
    
    console.log('API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\nSuccessfully processed document with Azure Document Intelligence!');
      console.log('Document Type:', result.documentType);
      console.log('Summary:', result.summary);
      console.log('Tags:', result.tags.join(', '));
      console.log('\nExtracted Text (first 300 chars):');
      console.log(result.extractedText.substring(0, 300) + '...');
    } else {
      console.error('Error processing document:', result.error);
    }
  } catch (error) {
    console.error('Error testing Azure Document Intelligence:', error);
  }
}

testAzureDocumentIntelligence();
