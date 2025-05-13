/**
 * Mock Document Processing Service
 * 
 * This is a simplified mock implementation of the document processing service
 * that doesn't use any Node.js-specific functions or libraries.
 * It's designed to be used in browser environments where the full
 * document processing service might not work.
 */

import { supabase } from "@/lib/supabase";

/**
 * Mock document processing service
 */
export const documentProcessingService = {
  /**
   * Process a document after upload
   * This mock implementation simulates document processing without
   * using any Node.js-specific functions or libraries
   */
  async processDocument(documentId: string, fileUrl: string, fileType: string, fileName: string): Promise<any> {
    try {
      console.log(`[MOCK] Processing document: ${documentId}, type: ${fileType}, name: ${fileName}`);
      
      // 1. Extract text from the document (simulated)
      const extractedText = await this.extractTextFromDocument(fileUrl, fileType);
      
      // 2. Generate summary and tags (simulated)
      const { summary, tags } = await this.generateSummaryAndTags(extractedText, fileName);
      
      // 3. Update the document in the database
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
        console.error('[MOCK] Error updating document:', error);
        return null;
      }
      
      console.log(`[MOCK] Document processed successfully: ${documentId}`);
      return data[0];
    } catch (error) {
      console.error('[MOCK] Error processing document:', error);
      return null;
    }
  },
  
  /**
   * Extract text from a document (simulated)
   */
  async extractTextFromDocument(fileUrl: string, fileType: string): Promise<string> {
    console.log(`[MOCK] Extracting text from ${fileType} document: ${fileUrl}`);
    
    // Generate simulated text based on file type
    let simulatedText = `This is simulated extracted text from a ${fileType} document.`;
    
    // Add more specific content based on file type and name
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
  
  /**
   * Generate a summary and tags for a document (simulated)
   */
  async generateSummaryAndTags(extractedText: string, fileName: string): Promise<{ summary: string, tags: string[] }> {
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
