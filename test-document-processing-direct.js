// Direct test for document processing functionality
const { documentProcessingService } = require('./src/services/documentProcessingService');

// Mock document data
const documentId = 'test-doc-' + Date.now();
const fileUrl = 'placeholder-test-document.pdf';
const fileType = 'pdf';
const fileName = 'Test Document.pdf';

console.log('Testing document processing with real implementation...');
console.log(`Document ID: ${documentId}`);
console.log(`File URL: ${fileUrl}`);
console.log(`File Type: ${fileType}`);
console.log(`File Name: ${fileName}`);

// Process the document
documentProcessingService.processDocument(documentId, fileUrl, fileType, fileName)
  .then(result => {
    console.log('\nDocument processing result:');
    if (result) {
      console.log('Success! Document processed successfully.');
      console.log('Summary:', result.summary);
      console.log('Tags:', result.ai_tags);
      console.log('Extracted text (first 100 chars):', result.extracted_text.substring(0, 100) + '...');
    } else {
      console.log('Failed to process document.');
    }
  })
  .catch(error => {
    console.error('Error during document processing test:', error);
  });
