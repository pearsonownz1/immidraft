/**
 * Text Extraction Service
 * 
 * This service provides methods for extracting text from various document types:
 * - PDF: Using pdf-parse (or mock in browser)
 * - DOCX: Using mammoth
 * - Images: Using tesseract.js for OCR
 * - HTML: Using unfluff
 * 
 * Browser-compatible version
 */

// In browser environments, we always use the mock implementation
import mockPdfParse, { setLastDocumentInfo } from './mockPdfParse';
// Always use the mock implementation in browser
const pdfParse = mockPdfParse;
console.log('Using mock PDF parser for browser environment');
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import unfluff from 'unfluff';

/**
 * Interface for text extraction result
 */
export interface TextExtractionResult {
  text: string;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Text extraction service
 */
export const textExtractionService = {
  /**
   * Extract text from a file based on its type
   * @param file The file to extract text from (Buffer or Blob)
   * @param fileType The type of the file (pdf, docx, image, html, etc.)
   * @param fileName Optional file name for better error messages
   */
  async extractText(
    file: Buffer | Blob,
    fileType: string,
    fileName?: string
  ): Promise<TextExtractionResult> {
    try {
      console.log(`Extracting text from ${fileType} file: ${fileName || 'unnamed'}`);
      
      // Normalize file type to lowercase
      const type = fileType.toLowerCase();
      
      // Extract text based on file type
      if (type.includes('pdf')) {
        return await this.extractFromPdf(file);
      } else if (type.includes('doc') || type.includes('docx') || type.includes('word')) {
        return await this.extractFromDocx(file);
      } else if (
        type.includes('image') || 
        type.includes('jpg') || 
        type.includes('jpeg') || 
        type.includes('png') || 
        type.includes('bmp') || 
        type.includes('tiff')
      ) {
        return await this.extractFromImage(file);
      } else if (type.includes('html') || type.includes('htm')) {
        return await this.extractFromHtml(file);
      } else if (type.includes('txt') || type.includes('text')) {
        return await this.extractFromText(file);
      } else {
        // Default to trying PDF extraction for unknown types
        try {
          return await this.extractFromPdf(file);
        } catch (pdfError) {
          // If PDF extraction fails, try text extraction
          try {
            return await this.extractFromText(file);
          } catch (textError) {
            throw new Error(`Unsupported file type: ${type}`);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      return {
        text: '',
        error: `Failed to extract text: ${error.message}`
      };
    }
  },
  
  /**
   * Extract text from a PDF file
   * @param file PDF file as Buffer or Blob
   */
  async extractFromPdf(file: Buffer | Blob): Promise<TextExtractionResult> {
    try {
      // In browser environment, we need to handle Blob directly
      let dataBuffer;
      
      if (file instanceof Blob) {
        // For browser environment
        const arrayBuffer = await file.arrayBuffer();
        dataBuffer = new Uint8Array(arrayBuffer);
      } else {
        // For Node.js environment
        dataBuffer = file;
      }
      
      // Parse PDF
      const result = await pdfParse(dataBuffer);
      
      return {
        text: result.text,
        metadata: {
          pageCount: result.numpages,
          info: result.info
        }
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return {
        text: '',
        error: `Failed to extract text from PDF: ${error.message}`
      };
    }
  },
  
  /**
   * Extract text from a DOCX file
   * @param file DOCX file as Buffer or Blob
   */
  async extractFromDocx(file: Buffer | Blob): Promise<TextExtractionResult> {
    try {
      // In browser environment, we need to handle Blob directly
      let buffer;
      
      if (file instanceof Blob) {
        // For browser environment
        const arrayBuffer = await file.arrayBuffer();
        buffer = { arrayBuffer: () => arrayBuffer };
      } else {
        // For Node.js environment
        buffer = { buffer: file };
      }
      
      // Extract text from DOCX
      const result = await mammoth.extractRawText(buffer);
      
      return {
        text: result.value,
        metadata: {
          messages: result.messages
        }
      };
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      return {
        text: '',
        error: `Failed to extract text from DOCX: ${error.message}`
      };
    }
  },
  
  /**
   * Extract text from an image using OCR
   * @param file Image file as Buffer or Blob
   */
  async extractFromImage(file: Buffer | Blob): Promise<TextExtractionResult> {
    try {
      // Tesseract.js works with various input types including Blob
      const result = await Tesseract.recognize(
        file,
        'eng', // English language
        {
          logger: m => console.log(`OCR Progress: ${m.status} (${Math.floor(m.progress * 100)}%)`)
        }
      );
      
      return {
        text: result.data.text,
        metadata: {
          confidence: result.data.confidence,
          // Just store basic metadata to avoid type errors
          hasText: result.data.text.length > 0
        }
      };
    } catch (error) {
      console.error('Error extracting text from image:', error);
      return {
        text: '',
        error: `Failed to extract text from image: ${error.message}`
      };
    }
  },
  
  /**
   * Extract text from HTML content
   * @param file HTML content as Buffer or Blob
   */
  async extractFromHtml(file: Buffer | Blob): Promise<TextExtractionResult> {
    try {
      // Convert to string
      let htmlString: string;
      
      if (file instanceof Blob) {
        htmlString = await file.text();
      } else {
        htmlString = new TextDecoder().decode(file);
      }
      
      // Extract text using unfluff
      const data = unfluff(htmlString);
      
      // Combine title and text
      const text = [data.title, data.text].filter(Boolean).join('\n\n');
      
      return {
        text,
        metadata: {
          title: data.title,
          author: data.author,
          date: data.date,
          description: data.description
        }
      };
    } catch (error) {
      console.error('Error extracting text from HTML:', error);
      return {
        text: '',
        error: `Failed to extract text from HTML: ${error.message}`
      };
    }
  },
  
  /**
   * Extract text from a plain text file
   * @param file Text file as Buffer or Blob
   */
  async extractFromText(file: Buffer | Blob): Promise<TextExtractionResult> {
    try {
      let text: string;
      
      if (file instanceof Blob) {
        text = await file.text();
      } else {
        text = new TextDecoder().decode(file);
      }
      
      return {
        text,
        metadata: {
          size: text.length
        }
      };
    } catch (error) {
      console.error('Error extracting text from text file:', error);
      return {
        text: '',
        error: `Failed to extract text from text file: ${error.message}`
      };
    }
  },
  
  /**
   * Detect the type of a file based on its content (magic numbers)
   * This is a simple implementation that checks for common file signatures
   * @param buffer File content as Buffer
   */
  detectFileType(buffer: Buffer | Uint8Array): string {
    // Convert to Uint8Array if it's a Buffer
    const data = buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;
    
    // Check for PDF signature
    if (data.length >= 4 && 
        data[0] === 0x25 && data[1] === 0x50 && 
        data[2] === 0x44 && data[3] === 0x46) {
      return 'pdf';
    }
    
    // Check for DOCX signature (ZIP file with specific content)
    if (data.length >= 4 && 
        data[0] === 0x50 && data[1] === 0x4B && 
        data[2] === 0x03 && data[3] === 0x04) {
      return 'docx'; // This is a ZIP file, could be DOCX
    }
    
    // Check for JPEG signature
    if (data.length >= 2 && 
        data[0] === 0xFF && data[1] === 0xD8) {
      return 'jpeg';
    }
    
    // Check for PNG signature
    if (data.length >= 8 && 
        data[0] === 0x89 && data[1] === 0x50 && 
        data[2] === 0x4E && data[3] === 0x47 && 
        data[4] === 0x0D && data[5] === 0x0A && 
        data[6] === 0x1A && data[7] === 0x0A) {
      return 'png';
    }
    
    // Default to text
    return 'txt';
  }
};
