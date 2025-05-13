import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import OpenAI from 'openai';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for all origins (or restrict as needed)
app.use(cors({
  origin: ['https://www.immidraft.com', 'https://immidraft.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration
const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const AZURE_DOCUMENT_INTELLIGENCE_KEY = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Initialize Azure Document Intelligence client
const documentIntelligenceClient = new DocumentAnalysisClient(
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
  new AzureKeyCredential(AZURE_DOCUMENT_INTELLIGENCE_KEY)
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'document-ocr-api',
    endpoints: ['/process-document']
  });
});

// Process document endpoint
app.post('/process-document', async (req, res) => {
  try {
    const { documentUrl, documentName, documentType } = req.body;
    
    if (!documentUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'documentUrl is required' 
      });
    }
    
    console.log(`Processing document: ${documentName || 'Unnamed'} (${documentUrl.substring(0, 50)}${documentUrl.length > 50 ? '...' : ''})`);
    
    let documentContent;
    
    // Check if the URL is a data URL
    if (documentUrl.startsWith('data:')) {
      console.log('Detected data URL, extracting content...');
      try {
        // Extract the base64 content from the data URL
        const matches = documentUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({
            success: false,
            error: 'Invalid data URL format'
          });
        }
        
        const contentType = matches[1];
        const base64Data = matches[2];
        documentContent = Buffer.from(base64Data, 'base64');
        
        console.log(`Extracted ${documentContent.length} bytes of ${contentType} data`);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Failed to extract content from data URL: ${error.message}`
        });
      }
    } else {
      // Download the document from a regular URL
      console.log('Downloading document from URL...');
      try {
        const response = await fetch(documentUrl);
        
        if (!response.ok) {
          return res.status(400).json({ 
            success: false, 
            error: `Failed to download document: ${response.statusText}` 
          });
        }
        
        documentContent = await response.buffer();
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Failed to download document: ${error.message}`
        });
      }
    }
    
    // Extract text from the document
    console.log('Extracting text from document...');
    const extractedText = await extractTextFromDocument(documentContent, documentType || getFileTypeFromName(documentName));
    
    if (!extractedText || extractedText.trim() === '') {
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from the document'
      });
    }
    
    // Generate summary and tags using OpenAI
    console.log('Generating summary with OpenAI...');
    const { summary, tags, documentType: detectedType } = await generateSummaryWithOpenAI(extractedText, documentName);
    
    // Return the processed document
    return res.json({
      success: true,
      documentName: documentName || 'Unnamed Document',
      documentType: detectedType || documentType || 'unknown',
      summary,
      tags,
      extractedText
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Error processing document: ${error.message}` 
    });
  }
});

/**
 * Extract text from a document using Azure Document Intelligence
 * @param {Buffer} documentContent - Document content as a Buffer
 * @param {string} fileType - Type of the file (pdf, docx, image, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDocument(documentContent, fileType = 'pdf') {
  try {
    console.log(`Extracting text from ${fileType} document using Azure Document Intelligence`);
    
    if (!AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || !AZURE_DOCUMENT_INTELLIGENCE_KEY) {
      console.warn('Azure Document Intelligence credentials not configured, using fallback extraction');
      return extractTextFallback(documentContent, fileType);
    }
    
    // Use Azure Document Intelligence to extract text
    const poller = await documentIntelligenceClient.beginAnalyzeDocument(
      "prebuilt-document", // Using the prebuilt document model
      documentContent
    );
    
    // Wait for the operation to complete
    const result = await poller.pollUntilDone();
    
    if (!result || !result.content) {
      console.warn('Azure Document Intelligence returned empty result, using fallback extraction');
      return extractTextFallback(documentContent, fileType);
    }
    
    console.log('Successfully extracted text using Azure Document Intelligence');
    return result.content;
  } catch (error) {
    console.error('Error extracting text with Azure Document Intelligence:', error);
    console.log('Falling back to basic text extraction');
    return extractTextFallback(documentContent, fileType);
  }
}

/**
 * Fallback text extraction when Azure Document Intelligence is not available
 * @param {Buffer} documentContent - Document content as a Buffer
 * @param {string} fileType - Type of the file (pdf, docx, image, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFallback(documentContent, fileType = 'pdf') {
  try {
    // Normalize file type
    const type = fileType.toLowerCase();
    
    // Basic text extraction based on file type
    if (type.includes('html') || type.includes('htm')) {
      return extractFromHtml(documentContent);
    } else if (type.includes('txt') || type.includes('text')) {
      return documentContent.toString('utf-8');
    } else {
      // For binary formats like PDF, DOCX, images, etc.
      // Return a placeholder message since we can't extract without proper libraries
      return `This is placeholder text for a ${type} document of approximately ${documentContent.length} bytes.
Without Azure Document Intelligence, we cannot properly extract text from this document type.
Please ensure Azure Document Intelligence is properly configured for full functionality.`;
    }
  } catch (error) {
    console.error('Error in fallback text extraction:', error);
    return `Failed to extract text: ${error.message}`;
  }
}

/**
 * Extract text from HTML content
 * @param {Buffer} buffer - HTML content as a Buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromHtml(buffer) {
  try {
    // Convert buffer to string
    const htmlString = buffer.toString('utf-8');
    
    // Very basic HTML text extraction
    const text = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return `Failed to extract text from HTML: ${error.message}`;
  }
}

/**
 * Detect file type based on content and file name
 * @param {Buffer} buffer - File content
 * @param {string} fileName - Name of the file
 * @returns {string} - Detected file type
 */
function detectFileType(buffer, fileName) {
  // First try to get type from file name if available
  if (fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension) {
      return extension;
    }
  }
  
  // If file name doesn't provide type, try to detect from content
  // Check for PDF signature
  if (buffer.length >= 4 && 
      buffer[0] === 0x25 && buffer[1] === 0x50 && 
      buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }
  
  // Check for DOCX signature (ZIP file with specific content)
  if (buffer.length >= 4 && 
      buffer[0] === 0x50 && buffer[1] === 0x4B && 
      buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'docx'; // This is a ZIP file, could be DOCX
  }
  
  // Check for JPEG signature
  if (buffer.length >= 2 && 
      buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return 'jpeg';
  }
  
  // Check for PNG signature
  if (buffer.length >= 8 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && 
      buffer[2] === 0x4E && buffer[3] === 0x47 && 
      buffer[4] === 0x0D && buffer[5] === 0x0A && 
      buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return 'png';
  }
  
  // Check for HTML
  if (buffer.length >= 10) {
    const start = buffer.toString('utf-8', 0, 100).toLowerCase();
    if (start.includes('<!doctype html>') || start.includes('<html')) {
      return 'html';
    }
  }
  
  // Default to unknown
  return 'unknown';
}

/**
 * Get file type from file name
 * @param {string} fileName - Name of the file
 * @returns {string} - File type
 */
function getFileTypeFromName(fileName) {
  if (!fileName) return 'unknown';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'docx';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'bmp':
    case 'tiff':
    case 'gif':
      return 'image';
    case 'html':
    case 'htm':
      return 'html';
    case 'txt':
      return 'text';
    default:
      return 'unknown';
  }
}

/**
 * Generate summary and tags using OpenAI
 * @param {string} text - Document text
 * @param {string} fileName - Name of the file
 * @returns {Promise<Object>} - Summary, tags, and document type
 */
async function generateSummaryWithOpenAI(text, fileName) {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set, using simple summary generation');
      return generateSimpleSummary(text);
    }
    
    console.log('Calling OpenAI API to generate summary...');
    
    // Truncate text if it's too long (OpenAI has token limits)
    const truncatedText = text.substring(0, 4000);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal assistant preparing immigration evidence. Your task is to summarize documents and identify their type and relevance to immigration cases."
        },
        {
          role: "user",
          content: `Summarize the following document. Identify if it's a recommendation letter, award certificate, publication, or patent. Note any names, affiliations, dates, and achievements.\n\nDocument name: ${fileName || 'Unnamed document'}\n\nDocument content:\n${truncatedText}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });
    
    const response = completion.choices[0].message.content || '';
    
    // Determine document type based on response content
    let documentType = "document";
    if (response.toLowerCase().includes("recommendation letter") || 
        response.toLowerCase().includes("reference letter")) {
      documentType = "recommendation_letter";
    } else if (response.toLowerCase().includes("patent")) {
      documentType = "patent";
    } else if (response.toLowerCase().includes("award") || 
              response.toLowerCase().includes("certificate")) {
      documentType = "award";
    } else if (response.toLowerCase().includes("publication") || 
              response.toLowerCase().includes("article") ||
              response.toLowerCase().includes("paper")) {
      documentType = "publication";
    }
    
    // Generate tags based on document type and content
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
    
    // Add additional tags based on content
    if (response.toLowerCase().includes("extraordinary")) tags.push("extraordinary_ability");
    if (response.toLowerCase().includes("contribution")) tags.push("contribution");
    if (response.toLowerCase().includes("research")) tags.push("research");
    if (response.toLowerCase().includes("innovation")) tags.push("innovation");
    
    return {
      summary: response,
      tags: [...new Set(tags)], // Remove duplicates
      documentType
    };
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    
    // Fallback to simple summary if OpenAI fails
    return generateSimpleSummary(text);
  }
}

/**
 * Generate a simple summary without OpenAI
 * @param {string} text - Document text
 * @returns {Object} - Summary, tags, and document type
 */
function generateSimpleSummary(text) {
  // Generate a simple summary (first 200 characters)
  const summary = text.substring(0, 200) + (text.length > 200 ? '...' : '');
  
  // Generate simple tags based on content
  const tags = generateTags(text);
  
  return {
    summary,
    tags,
    documentType: 'document'
  };
}

/**
 * Generate simple tags based on document content
 * @param {string} text - Document text
 * @returns {string[]} - Array of tags
 */
function generateTags(text) {
  const tags = [];
  const lowercaseText = text.toLowerCase();
  
  // Check for common skills/technologies
  const skillsToCheck = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'ruby', 'php',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
    'machine learning', 'ai', 'data science', 'analytics',
    'agile', 'scrum', 'project management',
    'frontend', 'backend', 'fullstack', 'devops', 'security'
  ];
  
  skillsToCheck.forEach(skill => {
    if (lowercaseText.includes(skill)) {
      tags.push(skill);
    }
  });
  
  // Check for education levels
  const educationLevels = [
    'bachelor', 'master', 'phd', 'doctorate', 'mba'
  ];
  
  educationLevels.forEach(level => {
    if (lowercaseText.includes(level)) {
      tags.push(level);
    }
  });
  
  // Check for immigration-related terms
  const immigrationTerms = [
    'visa', 'immigration', 'petition', 'recommendation', 'reference',
    'extraordinary', 'ability', 'achievement', 'award', 'publication'
  ];
  
  immigrationTerms.forEach(term => {
    if (lowercaseText.includes(term)) {
      tags.push(term);
    }
  });
  
  // Limit to 10 tags
  return tags.slice(0, 10);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Document OCR API server running on port ${PORT}`);
  console.log(`OpenAI API Key configured: ${OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`Azure Document Intelligence configured: ${(AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT && AZURE_DOCUMENT_INTELLIGENCE_KEY) ? 'Yes' : 'No'}`);
});
