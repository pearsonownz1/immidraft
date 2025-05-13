// Translation Service for document translation using Gemini LLM
import { supabase } from '../lib/supabase';
import { documentProcessingService } from './documentProcessingService';

// Types for translation service
export interface TranslationFile {
  id: string;
  filename: string;
  originalUrl: string;
  ocrText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  uploadedAt: string;
  status: 'uploaded' | 'ocr' | 'translated' | 'edited' | 'completed';
}

// API endpoint for AI processing (same as used in aiService)
const API_ENDPOINT = '/api/process-document';

// Translation service
export const translationService = {
  /**
   * Upload and process a document for translation
   * @param file File object to upload
   * @param languageFrom Source language
   * @param languageTo Target language
   * @returns Processed document data with OCR text
   */
  uploadDocument: async (
    file: File,
    languageFrom: string = 'auto',
    languageTo: string = 'en'
  ): Promise<TranslationFile> => {
    try {
      // Generate a unique ID for the translation file
      const id = crypto.randomUUID();
      
      // Upload and process the document using the document processing service
      const result = await documentProcessingService.uploadAndProcessDocument(file, 'documents');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process document');
      }
      
      // Create a translation file object
      const translationFile: TranslationFile = {
        id,
        filename: file.name,
        originalUrl: result.publicUrl,
        ocrText: result.extractedText || '',
        translatedText: '',
        languageFrom,
        languageTo,
        uploadedAt: new Date().toISOString(),
        status: 'ocr'
      };
      
      // Store the translation file in local storage for persistence
      const existingFiles = await translationService.getTranslationFiles();
      existingFiles.push(translationFile);
      localStorage.setItem('translationFiles', JSON.stringify(existingFiles));
      
      return translationFile;
    } catch (error: any) {
      console.error('Error uploading document for translation:', error);
      throw error;
    }
  },
  
  /**
   * Translate OCR text using Gemini LLM
   * @param translationFileId ID of the translation file
   * @param ocrText Text to translate
   * @param languageFrom Source language
   * @param languageTo Target language
   * @returns Translated text
   */
  translateText: async (
    translationFileId: string,
    ocrText: string,
    languageFrom: string = 'auto',
    languageTo: string = 'en'
  ): Promise<string> => {
    try {
      console.log('Calling API to translate text');
      
      // Prepare the prompt for the API
      const prompt = `
        You are a professional translator with expertise in multiple languages.
        
        Translate the following text ${languageFrom !== 'auto' ? `from ${languageFrom}` : ''} to ${languageTo}.
        Maintain the original formatting, paragraph structure, and any special characters or symbols.
        If there are any terms that you're unsure about, provide the best translation and indicate uncertainty with [?].
        
        Text to translate:
        ${ocrText}
      `;
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'translation',
          documentName: `Translation to ${languageTo}`,
          documentText: prompt,
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const translatedText = data.summary || '';
      
      // Update the translation file with the translated text
      const existingFiles = await translationService.getTranslationFiles();
      const updatedFiles = existingFiles.map(file => {
        if (file.id === translationFileId) {
          return {
            ...file,
            translatedText,
            status: 'translated' as const
          };
        }
        return file;
      });
      
      localStorage.setItem('translationFiles', JSON.stringify(updatedFiles));
      
      return translatedText;
    } catch (error: any) {
      console.error('Error translating text:', error);
      
      // Fallback if API call fails
      return `[Translation Error: ${error.message}]`;
    }
  },
  
  /**
   * Update the translated text for a translation file
   * @param translationFileId ID of the translation file
   * @param translatedText Updated translated text
   * @returns Updated translation file
   */
  updateTranslatedText: async (
    translationFileId: string,
    translatedText: string
  ): Promise<TranslationFile> => {
    try {
      const existingFiles = await translationService.getTranslationFiles();
      const fileIndex = existingFiles.findIndex(file => file.id === translationFileId);
      
      if (fileIndex === -1) {
        throw new Error('Translation file not found');
      }
      
      const updatedFile = {
        ...existingFiles[fileIndex],
        translatedText,
        status: 'edited' as const
      };
      
      existingFiles[fileIndex] = updatedFile;
      localStorage.setItem('translationFiles', JSON.stringify(existingFiles));
      
      return updatedFile;
    } catch (error: any) {
      console.error('Error updating translated text:', error);
      throw error;
    }
  },
  
  /**
   * Generate a downloadable report for a translation file
   * @param translationFileId ID of the translation file
   * @param format Format of the report ('pdf' or 'docx')
   * @returns URL of the generated report
   */
  generateReport: async (
    translationFileId: string,
    format: 'pdf' | 'docx' = 'pdf'
  ): Promise<string> => {
    try {
      const existingFiles = await translationService.getTranslationFiles();
      const file = existingFiles.find(f => f.id === translationFileId);
      
      if (!file) {
        throw new Error('Translation file not found');
      }
      
      // Update the file status
      const updatedFiles = existingFiles.map(f => {
        if (f.id === translationFileId) {
          return {
            ...f,
            status: 'completed' as const
          };
        }
        return f;
      });
      
      localStorage.setItem('translationFiles', JSON.stringify(updatedFiles));
      
      // In a real implementation, this would generate a PDF or DOCX file
      // For now, we'll just return a mock URL
      return `data:application/octet-stream;base64,${btoa(JSON.stringify({
        filename: file.filename,
        originalText: file.ocrText,
        translatedText: file.translatedText,
        languageFrom: file.languageFrom,
        languageTo: file.languageTo,
        timestamp: new Date().toISOString()
      }))}`;
    } catch (error: any) {
      console.error('Error generating report:', error);
      throw error;
    }
  },
  
  /**
   * Get all translation files
   * @returns Array of translation files
   */
  getTranslationFiles: async (): Promise<TranslationFile[]> => {
    try {
      const filesJson = localStorage.getItem('translationFiles');
      return filesJson ? JSON.parse(filesJson) : [];
    } catch (error: any) {
      console.error('Error getting translation files:', error);
      return [];
    }
  },
  
  /**
   * Get a translation file by ID
   * @param translationFileId ID of the translation file
   * @returns Translation file
   */
  getTranslationFileById: async (translationFileId: string): Promise<TranslationFile | null> => {
    try {
      const existingFiles = await translationService.getTranslationFiles();
      return existingFiles.find(file => file.id === translationFileId) || null;
    } catch (error: any) {
      console.error('Error getting translation file by ID:', error);
      return null;
    }
  },
  
  /**
   * Delete a translation file
   * @param translationFileId ID of the translation file
   * @returns Success status
   */
  deleteTranslationFile: async (translationFileId: string): Promise<boolean> => {
    try {
      const existingFiles = await translationService.getTranslationFiles();
      const updatedFiles = existingFiles.filter(file => file.id !== translationFileId);
      localStorage.setItem('translationFiles', JSON.stringify(updatedFiles));
      return true;
    } catch (error: any) {
      console.error('Error deleting translation file:', error);
      return false;
    }
  }
};
