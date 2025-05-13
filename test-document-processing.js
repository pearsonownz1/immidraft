// Browser-compatible test script for document processing functionality
// This version doesn't use any Node.js-specific functions

// Initialize Supabase client if available
let supabase;

// Try to get Supabase client from window (browser environment)
if (typeof window !== 'undefined' && window.supabase) {
  supabase = window.supabase;
  console.log('Using Supabase client from window');
} else if (typeof window !== 'undefined') {
  // If we're in a browser but don't have supabase on window, try to initialize it
  try {
    const supabaseUrl = window.VITE_SUPABASE_URL || 'https://example.supabase.co';
    const supabaseKey = window.VITE_SUPABASE_ANON_KEY || 'public-anon-key';
    
    console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
    
    // Check if createClient is available
    if (typeof window.supabaseCreateClient === 'function') {
      supabase = window.supabaseCreateClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase createClient not available in browser');
    }
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
}

// Mock document processing service
const documentProcessingService = {
  async extractTextFromDocument(fileUrl, fileType) {
    console.log(`[MOCK] Extracting text from ${fileType} document: ${fileUrl}`);
    
    // Generate simulated text based on file type
    let simulatedText = `This is simulated extracted text from a ${fileType} document.`;
    
    // Add more specific content based on file type
    if (fileType.includes('pdf')) {
      simulatedText += ' The PDF document contains several pages of text that would normally be extracted using pdf-parse.';
    } else if (fileType.includes('doc') || fileType.includes('docx')) {
      simulatedText += ' The Word document contains formatted text that would normally be extracted using mammoth.';
    } else if (fileType.includes('jpg') || fileType.includes('png') || fileType.includes('image')) {
      simulatedText += ' The image contains text that would normally be extracted using OCR via tesseract.js.';
    } else if (fileType.includes('html')) {
      simulatedText += ' The HTML document contains structured content that would normally be extracted using unfluff.';
    }
    
    // Add some content based on the URL
    if (fileUrl.includes('letter') || fileUrl.includes('recommendation')) {
      simulatedText += '\n\nDear Immigration Officer,\n\nI am writing to recommend the applicant for the visa. They have demonstrated extraordinary ability in their field...\n\nSincerely,\nDr. Jane Smith';
    } else if (fileUrl.includes('award') || fileUrl.includes('certificate')) {
      simulatedText += '\n\nCertificate of Achievement\n\nThis certifies that the applicant has been recognized for outstanding contributions to the field...';
    } else if (fileUrl.includes('publication') || fileUrl.includes('paper')) {
      simulatedText += '\n\nAbstract\n\nThis paper presents a novel approach to solving a significant problem in the field...';
    } else if (fileUrl.includes('patent')) {
      simulatedText += '\n\nPatent Description\n\nA novel method and apparatus for improving efficiency in the field...';
    }
    
    return simulatedText;
  },
  
  async generateSummaryAndTags(extractedText, fileName) {
    console.log(`[MOCK] Generating summary and tags for document: ${fileName}`);
    
    // Generate document type based on filename
    let documentType = "document";
    if (fileName.toLowerCase().includes("letter") || fileName.toLowerCase().includes("recommendation")) {
      documentType = "recommendation_letter";
    } else if (fileName.toLowerCase().includes("patent")) {
      documentType = "patent";
    } else if (fileName.toLowerCase().includes("award") || fileName.toLowerCase().includes("certificate")) {
      documentType = "award";
    } else if (fileName.toLowerCase().includes("publication") || fileName.toLowerCase().includes("paper")) {
      documentType = "publication";
    }
    
    // Generate tags based on document type
    const tags = [documentType];
    if (documentType === "recommendation_letter") {
      tags.push("support_evidence");
    } else if (documentType === "patent") {
      tags.push("original_contribution");
    } else if (documentType === "award") {
      tags.push("recognition");
    } else if (documentType === "publication") {
      tags.push("scholarly_work");
    }
    
    // Generate a summary based on document type
    let summary = "";
    if (documentType === "recommendation_letter") {
      summary = `This appears to be a recommendation letter for an immigration case. The letter discusses the applicant's achievements and contributions in their field.`;
    } else if (documentType === "patent") {
      summary = `This document appears to be a patent related to technology innovation. It describes a novel invention that demonstrates the applicant's original contribution to their field.`;
    } else if (documentType === "award") {
      summary = `This document appears to be an award or certificate recognizing the applicant's achievements in their field. It demonstrates recognition of the applicant's work.`;
    } else if (documentType === "publication") {
      summary = `This document appears to be a scholarly publication or research paper. It demonstrates the applicant's contributions to academic knowledge in their field.`;
    } else {
      summary = `This document contains information relevant to the immigration case. It provides evidence of the applicant's qualifications and achievements.`;
    }
    
    // Add some content based on the extracted text
    if (extractedText.includes("extraordinary ability")) {
      summary += " The document specifically mentions the applicant's extraordinary ability in their field.";
      tags.push("extraordinary_ability");
    }
    if (extractedText.includes("contributions")) {
      summary += " It highlights significant contributions made by the applicant.";
      tags.push("contributions");
    }
    
    return {
      summary,
      tags
    };
  }
};

// Mock document data for testing
const mockDocuments = [
  // Remote test documents (simulated)
  {
    id: 'test-doc-1',
    name: 'Recommendation Letter from Dr. Smith.pdf',
    type: 'pdf',
    url: 'https://example.com/recommendation-letter.pdf'
  },
  {
    id: 'test-doc-2',
    name: 'Patent #12345 - Innovative Technology.pdf',
    type: 'pdf',
    url: 'https://example.com/patent.pdf'
  },
  {
    id: 'test-doc-3',
    name: 'Award Certificate - Excellence in Innovation.pdf',
    type: 'pdf',
    url: 'https://example.com/award.pdf'
  },
  {
    id: 'test-doc-4',
    name: 'Research Paper - Advances in AI.pdf',
    type: 'pdf',
    url: 'https://example.com/paper.pdf'
  }
];

async function testDocumentProcessing() {
  try {
    console.log('Testing document processing functionality...');
    
    for (const doc of mockDocuments) {
      console.log(`\nProcessing document: ${doc.name}`);
      
      // Extract text from the document (simulated)
      const extractedText = await documentProcessingService.extractTextFromDocument(doc.url, doc.type);
      console.log('Extracted text:', extractedText.substring(0, 100) + '...');
      
      // Generate summary and tags
      const { summary, tags } = await documentProcessingService.generateSummaryAndTags(extractedText, doc.name);
      console.log('Summary:', summary);
      console.log('Tags:', tags);
      
      // In a real implementation, we would update the document in the database
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('documents')
            .update({
              extracted_text: extractedText,
              summary: summary,
              ai_tags: tags
            })
            .eq('id', doc.id)
            .select();
          
          if (error) {
            console.error('Error updating document in database:', error);
          } else {
            console.log('Document updated in database:', data);
          }
        } catch (dbError) {
          console.error('Error interacting with database:', dbError);
        }
      } else {
        console.log('Supabase client not available, skipping database update');
      }
      
      console.log('Document processed successfully!');
    }
    
    console.log('\nAll documents processed successfully!');
  } catch (error) {
    console.error('Error testing document processing:', error);
  }
}

// Run the test
testDocumentProcessing();

// Export for browser environments
if (typeof window !== 'undefined') {
  window.testDocumentProcessing = testDocumentProcessing;
  window.documentProcessingService = documentProcessingService;
}
