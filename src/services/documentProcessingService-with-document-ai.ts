import { supabase } from "@/lib/supabase";

/**
 * Service for processing documents, extracting text, and generating summaries
 * Using Google Cloud Document AI and LLM
 */
export const documentProcessingService = {
  /**
   * Process a document after upload
   * - Extract text using Google Cloud Document AI
   * - Generate summary and tags using LLM
   * - Update the document in the database with extracted text and summary
   */
  async processDocument(documentId: string, fileUrl: string, fileType: string, fileName: string): Promise<any> {
    try {
      console.log(`Processing document: ${documentId}, type: ${fileType}, name: ${fileName}`);
      
      // Call the API endpoint to process the document
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentUrl: fileUrl,
          documentType: fileType,
          documentName: fileName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }
      
      // Get the results from the API
      const { extractedText, summary, tags } = await response.json();
      
      if (!extractedText) {
        console.error(`Failed to extract text from document: ${documentId}`);
        return null;
      }
      
      // Update the document in the database
      const { data, error } = await supabase
        .from('documents')
        .update({
          extracted_text: extractedText,
          summary: summary,
          ai_tags: tags
        })
        .eq('id', documentId)
        .select();
      
      if (error) {
        console.error('Error updating document with extracted text and summary:', error);
        return null;
      }
      
      console.log(`Document processed successfully: ${documentId}`);
      return data[0];
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update the document with error information
      try {
        const { data, error: updateError } = await supabase
          .from('documents')
          .update({
            extracted_text: `Failed to extract text: ${error.message}`,
            summary: 'Document processing failed',
            ai_tags: ['error', 'processing_failed']
          })
          .eq('id', documentId)
          .select();
          
        if (updateError) {
          console.error('Error updating document with error information:', updateError);
        }
      } catch (updateError) {
        console.error('Error updating document with error status:', updateError);
      }
      
      return null;
    }
  },
  
  /**
   * Reprocess a document that has already been uploaded
   * Useful for updating the extracted text and summary after changes to the processing pipeline
   */
  async reprocessDocument(documentId: string): Promise<any> {
    try {
      console.log(`Reprocessing document: ${documentId}`);
      
      // Get the document from the database
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (fetchError || !document) {
        console.error('Error fetching document for reprocessing:', fetchError);
        return null;
      }
      
      // Get the file URL from the document
      const fileUrl = document.file_url;
      const fileType = document.type || '';
      const fileName = document.name || '';
      
      if (!fileUrl) {
        console.error('Document has no file URL:', documentId);
        return null;
      }
      
      // Process the document
      return await this.processDocument(documentId, fileUrl, fileType, fileName);
    } catch (error) {
      console.error('Error reprocessing document:', error);
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
        console.error(`Error processing document ${documentId}:`, error);
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
