/**
 * Test script for the Document AI integration with mock services
 * This script demonstrates how to use the mock Document AI services
 * to process documents without needing to set up Google Cloud Document AI
 * or OpenAI API keys.
 */

import { mockDocumentAIService } from './src/services/mockDocumentAIService.js';
import { mockDocumentProcessingServiceWithAI } from './src/services/mockDocumentProcessingServiceWithAI.ts';

// Sample document content (base64 encoded)
const sampleDocumentContent = "TW9jayBkb2N1bWVudCBjb250ZW50IGZvciB0ZXN0aW5nIHB1cnBvc2Vz";

async function testDocumentAI() {
  console.log('Testing Document AI integration with mock services...');
  
  try {
    // Test the mock Document AI service directly
    console.log('\n1. Testing mockDocumentAIService...');
    const result = await mockDocumentAIService.mockProcessDocument(
      sampleDocumentContent,
      'application/pdf'
    );
    
    console.log('Mock Document AI result:');
    console.log('- Extracted text:', result.extractedText.substring(0, 100) + '...');
    console.log('- Summary:', result.summary);
    console.log('- Tags:', result.tags.join(', '));
    
    // Test the mock Document Processing Service
    console.log('\n2. Testing mockDocumentProcessingServiceWithAI...');
    const processedDoc = await mockDocumentProcessingServiceWithAI.processDocument(
      'test-doc-1',
      'https://example.com/mock-document.pdf',
      'resume',
      'Sample Resume.pdf'
    );
    
    console.log('Mock Document Processing result:');
    console.log('- Document ID:', processedDoc.id);
    console.log('- Extracted text:', processedDoc.extracted_text.substring(0, 100) + '...');
    console.log('- Summary:', processedDoc.summary);
    console.log('- Tags:', processedDoc.ai_tags.join(', '));
    
    // Test batch processing
    console.log('\n3. Testing batch document processing...');
    const batchResults = await mockDocumentProcessingServiceWithAI.batchProcessDocuments([
      'test-doc-1',
      'test-doc-2',
      'test-doc-3'
    ]);
    
    console.log('Batch processing results:');
    batchResults.forEach((result, index) => {
      console.log(`Document ${index + 1}:`);
      console.log('- Document ID:', result.documentId);
      console.log('- Success:', result.success);
      if (result.data) {
        console.log('- Summary:', result.data.summary);
      }
    });
    
    console.log('\nAll tests completed successfully!');
    console.log('\nTo test the UI integration, run:');
    console.log('npm run dev');
    console.log('Then navigate to: http://localhost:5185/test-document-ai');
    
  } catch (error) {
    console.error('Error testing Document AI integration:', error);
  }
}

// Run the tests
testDocumentAI();
