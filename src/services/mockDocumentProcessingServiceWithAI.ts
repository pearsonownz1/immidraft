import { supabase } from "@/lib/supabase";
import { mockProcessDocument } from "./mockDocumentAIService";

/**
 * Mock service for processing documents, extracting text, and generating summaries
 * Using mock Document AI and LLM services for testing
 */
export const mockDocumentProcessingServiceWithAI = {
  /**
   * Process a document after upload
   * - Extract text using mock Document AI
   * - Generate summary and tags using mock LLM
   * - Update the document in the database with extracted text and summary
   */
  async processDocument(documentId: string, fileUrl: string, fileType: string, fileName: string): Promise<any> {
    try {
      console.log(`Processing document with mock AI: ${documentId}, type: ${fileType}, name: ${fileName}`);
      
      // For testing purposes, we'll use a mock document content
      // In a real scenario, we would download the document from the fileUrl
      const mockDocumentContent = "TW9jayBkb2N1bWVudCBjb250ZW50IGZvciB0ZXN0aW5nIHB1cnBvc2Vz"; // Base64 encoded
      const mimeType = getMimeType(fileType);
      
      // Process the document with the mock Document AI service
      const { extractedText, summary, tags } = await mockProcessDocument(mockDocumentContent, mimeType);
      
      if (!extractedText) {
        console.error(`Failed to extract text from document: ${documentId}`);
        return null;
      }
      
      console.log(`Document processed successfully with mock AI: ${documentId}`);
      
      // Return the processed document data
      // In a real scenario, we would update the document in the database
      return {
        id: documentId,
        extracted_text: extractedText,
        summary: summary,
        ai_tags: tags
      };
    } catch (error) {
      console.error('Error processing document with mock AI:', error);
      return null;
    }
  },
  
  /**
   * Reprocess a document that has already been uploaded
   * Useful for updating the extracted text and summary after changes to the processing pipeline
   */
  async reprocessDocument(documentId: string): Promise<any> {
    try {
      console.log(`Reprocessing document with mock AI: ${documentId}`);
      
      // For testing purposes, we'll use mock data
      // In a real scenario, we would get the document from the database
      const mockDocument = {
        id: documentId,
        file_url: "https://example.com/mock-document.pdf",
        type: "resume",
        name: "Mock Resume"
      };
      
      // Process the document
      return await this.processDocument(
        mockDocument.id,
        mockDocument.file_url,
        mockDocument.type,
        mockDocument.name
      );
    } catch (error) {
      console.error('Error reprocessing document with mock AI:', error);
      return null;
    }
  },
  
  /**
   * Batch process multiple documents
   * Useful for updating all documents after changes to the processing pipeline
   */
  async batchProcessDocuments(documentIds: string[]): Promise<any[]> {
    const results = [];
    
    for (const documentId of documentIds) {
      try {
        const result = await this.reprocessDocument(documentId);
        results.push({
          documentId,
          success: !!result,
          data: result
        });
      } catch (error) {
        console.error(`Error processing document ${documentId} with mock AI:`, error);
        results.push({
          documentId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
};

/**
 * Get MIME type based on document type
 */
function getMimeType(documentType: string): string {
  if (!documentType) return 'application/pdf';
  
  const type = documentType.toLowerCase();
  
  if (type.includes('pdf')) {
    return 'application/pdf';
  } else if (type.includes('doc') || type.includes('word')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (type.includes('jpg') || type.includes('jpeg')) {
    return 'image/jpeg';
  } else if (type.includes('png')) {
    return 'image/png';
  } else if (type.includes('tiff')) {
    return 'image/tiff';
  } else if (type.includes('html')) {
    return 'text/html';
  } else if (type.includes('txt') || type.includes('text')) {
    return 'text/plain';
  }
  
  // Default to PDF
  return 'application/pdf';
}
