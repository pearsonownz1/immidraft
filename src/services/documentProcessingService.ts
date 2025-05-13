// Document Processing Service using Azure Document Intelligence API
import { supabase } from '../lib/supabase';
import { mockDocumentProcessingServiceWithAI } from './mockDocumentProcessingServiceWithAIBrowser';

// Check if we're in production or development
const isProduction = window.location.hostname === 'www.immidraft.com' ||
                    window.location.hostname === 'immidraft.vercel.app';

// Document API URL (now using Azure Document Intelligence)
// For production, use the same domain as the frontend to avoid CORS issues
const DOCUMENT_API_URL = isProduction 
  ? (window.location.hostname === 'www.immidraft.com' 
     ? 'https://immidraft.vercel.app/api'  // Production domain
     : `${window.location.origin}/api`)    // Same origin for other production domains
  : 'http://localhost:8080';               // Development

// Use mock service for local development
const useMockService = !isProduction;

/**
 * Process a document using Azure Document Intelligence
 * @param documentUrl URL of the document to process
 * @param documentName Name of the document
 * @param documentType Type of document (e.g., 'resume', 'invoice', etc.)
 * @returns Processed document data including extracted text, summary, and tags
 */
export async function processDocument(documentUrl: string, documentName: string, documentType: string = 'resume'): Promise<any> {
  try {
    // If using mock service for local development
    if (useMockService) {
      console.log('Using mock document processing service for local development');
      const documentId = `mock-${Date.now()}`;
      const result = await mockDocumentProcessingServiceWithAI.processDocument(
        documentId,
        documentUrl,
        documentType,
        documentName
      );
      
      if (!result) {
        throw new Error('Mock document processing failed');
      }
      
      return {
        success: true,
        documentName: documentName,
        documentType: documentType,
        extractedText: result.extracted_text,
        summary: result.summary,
        tags: result.ai_tags || [],
      };
    }
    
    // For production, use the real API
    console.log('Processing document with Azure Document Intelligence API:', documentUrl);
    
    // Always use the Document API directly
    const apiUrl = `${DOCUMENT_API_URL}/process-document`;
      
    console.log(`Using API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl,
        documentName,
        documentType,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Document API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return the processed document data
    return {
      success: true,
      documentName: data.documentName,
      documentType: data.documentType,
      extractedText: data.extracted_text || data.extractedText,
      summary: data.summary,
      tags: data.ai_tags || data.tags || [],
    };
  } catch (error: any) {
    console.error('Error processing document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload a document to Supabase Storage and process it with Document AI
 * @param file File object to upload
 * @param bucketName Supabase Storage bucket name
 * @param documentType Type of document (e.g., 'resume', 'invoice', etc.)
 * @returns Processed document data
 */
export async function uploadAndProcessDocument(file: File, bucketName: string = 'documents', documentType: string = 'resume'): Promise<any> {
  try {
    // Determine document type from file extension if not provided
    let detectedDocType = documentType;
    if (file.name) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'docx' || extension === 'doc') {
        detectedDocType = `${documentType}_${extension}`;
        console.log(`Detected Word document: ${extension}, setting document type to ${detectedDocType}`);
      } else if (extension === 'pdf') {
        detectedDocType = `${documentType}_pdf`;
        console.log(`Detected PDF document, setting document type to ${detectedDocType}`);
      }
    }
    
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file);
    
    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    // Process the document using Azure Document Intelligence or mock service
    const processResult = await processDocument(publicUrl, file.name, detectedDocType);
    
    return {
      ...processResult,
      fileName,
      publicUrl,
    };
  } catch (error: any) {
    console.error('Error uploading and processing document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Document Processing Service
 * This is the main export that provides document processing functionality
 */
export const documentProcessingService = {
  /**
   * Process a document using Azure Document Intelligence
   * @param documentId ID of the document (for tracking)
   * @param documentUrl URL of the document to process
   * @param documentType Type of document (e.g., 'resume', 'invoice', etc.)
   * @param documentName Name of the document
   * @returns Processed document data including extracted text, summary, and tags
   */
  processDocument: async (documentId: string, documentUrl: string, documentType: string, documentName: string): Promise<any> => {
    try {
      // If using mock service for local development
      if (useMockService) {
        console.log(`Using mock service to process document ${documentId}`);
        return await mockDocumentProcessingServiceWithAI.processDocument(
          documentId,
          documentUrl,
          documentType,
          documentName
        );
      }
      
      // For production, use the real API
      console.log(`Processing document ${documentId} with Azure Document Intelligence API:`, documentUrl);
      
      // Always use the Document API directly
      const apiUrl = `${DOCUMENT_API_URL}/process-document`;
        
      console.log(`Using API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentUrl,
          documentName,
          documentType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Document API error: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Return the processed document data
      return {
        id: documentId,
        extracted_text: data.extracted_text || data.extractedText,
        summary: data.summary,
        ai_tags: data.ai_tags || data.tags || [],
      };
    } catch (error: any) {
      console.error('Error processing document:', error);
      return null;
    }
  },
  
  /**
   * Upload and process a document
   * @param file File object to upload
   * @param bucketName Supabase Storage bucket name
   * @param documentType Type of document (e.g., 'resume', 'invoice', etc.)
   * @returns Processed document data
   */
  uploadAndProcessDocument: async (file: File, bucketName: string = 'documents', documentType: string = 'resume'): Promise<any> => {
    return uploadAndProcessDocument(file, bucketName, documentType);
  }
};
