// Vercel Serverless Function for Document Processing with Azure Document Intelligence
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import mammoth from 'mammoth';

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Azure Document Intelligence client
const documentIntelligenceClient = new DocumentAnalysisClient(
  process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
);

/**
 * Main handler for the API endpoint
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.immidraft.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request body for debugging
    console.log('Process Document Request:', JSON.stringify(req.body, null, 2));
    console.log('Environment variables check:', {
      hasAzureEndpoint: !!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      hasAzureKey: !!process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
    });

    const { documentUrl, documentType, documentName, documentText, prompt } = req.body;

    // Check if we have a direct text input or a document URL
    if (!documentUrl && !documentText) {
      return res.status(400).json({ error: 'Either document URL or document text is required' });
    }

    // If we have a document URL, validate it
    if (documentUrl) {
      try {
        new URL(documentUrl);
      } catch (error) {
        console.error('Invalid document URL:', documentUrl);
        return res.status(400).json({
          error: 'Invalid document URL provided',
          message: 'The document URL must be a valid absolute URL',
          input: documentUrl
        });
      }
    }

    // Validate Azure Document Intelligence credentials
    if (!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || !process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY) {
      console.error('Missing Azure Document Intelligence credentials');
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'Azure Document Intelligence credentials are missing',
        detail: 'The server is missing required environment variables for document processing'
      });
    }

    // Validate Google Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing Google Gemini API key');
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'Google Gemini API key is missing',
        detail: 'The server is missing required environment variables for AI summary generation'
      });
    }

    try {
      let extractedText;
      
      // If we have document text directly, use that
      if (documentText) {
        console.log('Using provided document text, length:', documentText.length);
        extractedText = documentText;
      } else {
        // Otherwise download and process the document
        console.log('Downloading document from URL:', documentUrl.substring(0, 100) + '...');
        const documentBuffer = await downloadDocument(documentUrl);
        console.log('Document downloaded successfully, size:', documentBuffer.length);

        // Process with Azure Document Intelligence
        console.log('Processing document with Azure Document Intelligence...');
        extractedText = await processWithAzureDocumentIntelligence(documentBuffer, documentType);
        console.log('Text extraction successful, length:', extractedText.length);
      }

      // If a custom prompt is provided, use it for LLM processing
      let summary, tags;
      if (prompt) {
        console.log('Using custom prompt for LLM processing');
        summary = await processWithCustomPrompt(extractedText, prompt);
        tags = []; // No tags for custom prompts
      } else {
        // Otherwise generate summary and tags as usual
        console.log('Generating summary with Google Gemini...');
        const result = await generateSummaryWithLLM(extractedText, documentType, documentName);
        summary = result.summary;
        tags = result.tags;
      }
      console.log('LLM processing successful');

      // Return results with field names matching what the frontend expects
      return res.status(200).json({
        success: true,
        documentName: documentName || 'Unnamed Document',
        documentType: documentType || 'unknown',
        extracted_text: extractedText, // Changed from extractedText to extracted_text
        summary,
        ai_tags: tags // Changed from tags to ai_tags
      });
    } catch (processingError) {
      // Log the specific processing error with full details
      console.error('Document processing error:', processingError);
      console.error('Error stack:', processingError.stack);
      console.error('Error step:', processingError.step || 'unknown');
      console.error('Error details:', processingError.details || 'No additional details');

      // Return a structured error response
      return res.status(500).json({
        success: false,
        error: 'Document processing failed',
        message: processingError.message,
        step: processingError.step || 'unknown',
        details: processingError.details || null
      });
    }
  } catch (error) {
    // Log the general handler error with full details
    console.error('Error in process-document handler:', error);
    console.error('Error stack:', error.stack);

    // Always return a properly formatted JSON response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Download document from URL
 */
async function downloadDocument(url) {
  try {
    // Regular URL
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(`Failed to fetch document: ${response.statusText}`);
      error.step = 'download';
      error.details = {
        status: response.status,
        url: url.substring(0, 100) + '...' // Truncate URL for logging
      };
      throw error;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading document:', error);

    // Add step information if not already present
    if (!error.step) {
      error.step = 'download';
    }

    throw error;
  }
}

/**
 * Process document with Azure Document Intelligence
 */
async function processWithAzureDocumentIntelligence(documentBuffer, documentType) {
  try {
    console.log(`Processing document with Azure Document Intelligence, type: ${documentType || 'unknown'}`);

    // Check if this is a DOCX file
    const isDocx = documentType && 
      (documentType.toLowerCase().includes('docx') || 
       documentType.toLowerCase().includes('word') ||
       documentType.toLowerCase().includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'));

    if (isDocx) {
      console.log('Detected DOCX file, using mammoth for text extraction');
      try {
        // Use mammoth to extract text from DOCX
        const result = await mammoth.extractRawText({ buffer: documentBuffer });
        console.log('Successfully extracted text using mammoth');
        return result.value || 'No text content found in DOCX file';
      } catch (docxError) {
        console.error('Error extracting text from DOCX with mammoth:', docxError);
        throw new Error(`Failed to extract text from DOCX: ${docxError.message}`);
      }
    }

    // For non-DOCX files, use Azure Document Intelligence
    const poller = await documentIntelligenceClient.beginAnalyzeDocument(
      "prebuilt-document", // Using the prebuilt document model
      documentBuffer
    );

    // Wait for the operation to complete
    const result = await poller.pollUntilDone();

    if (!result || !result.content) {
      const error = new Error('Azure Document Intelligence returned empty result');
      error.step = 'azure_document_intelligence';
      error.details = { result: result ? 'Result object exists but no content' : 'No result object' };
      throw error;
    }

    console.log('Successfully extracted text using Azure Document Intelligence');
    return result.content;
  } catch (error) {
    console.error('Error processing document with Azure Document Intelligence:', error);

    // Add step information if not already present
    if (!error.step) {
      error.step = 'azure_document_intelligence';
    }

    // If Azure Document Intelligence processing fails, fall back to a simple text extraction
    console.log('Azure Document Intelligence processing failed, falling back to simple text extraction');

    // If it's a PDF, we can't do much without Document Intelligence
    if (documentType && documentType.toLowerCase().includes('pdf')) {
      return `Failed to extract text from PDF document. Azure Document Intelligence processing error: ${error.message}`;
    }

    // For text-based documents, we can try to extract text directly
    try {
      // Convert buffer to string for text-based documents
      const mimeType = getMimeType(documentType);
      if (mimeType.startsWith('text/') || mimeType.includes('html')) {
        return documentBuffer.toString('utf-8');
      }
    } catch (fallbackError) {
      console.error('Fallback text extraction also failed:', fallbackError);
    }

    // If all else fails, throw the original error
    throw error;
  }
}

/**
 * Generate summary and tags using LLM
 */
async function generateSummaryWithLLM(extractedText, documentType, documentName) {
  try {
    // Limit text length to avoid token limits
    const limitedText = extractedText.substring(0, 8000);

    // Create prompt for the LLM
    const prompt = `
      You are an expert immigration document analyzer.

      Document Type: ${documentType || 'Unknown'}
      Document Name: ${documentName || 'Unnamed document'}
      Document Content: ${limitedText}

      Please provide:
      1. A concise summary of this document (max 200 words)
      2. A list of 3-5 relevant tags for this document

      IMPORTANT: Return ONLY raw JSON without any markdown formatting, code blocks, or backticks.
      Your entire response should be valid JSON that can be directly parsed.
      
      Example of the expected format:
      {"summary":"your summary here","tags":["tag1","tag2","tag3"]}
    `;

    // Call Google Gemini API with newer model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest"  // Try the newer Gemini 1.5 model
    });
    
    let responseText;
    try {
      // Simplest way for a text-only prompt
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text().trim();
    } catch (error) {
      console.error("Error generating summary with Gemini:", error);
      // If you have a fallback or specific error handling
      if (error.message && error.message.includes("SAFETY")) {
        console.warn("Gemini generation blocked due to safety settings.");
        return {
          summary: "Content generation blocked due to safety settings",
          tags: ["error", "safety_blocked"]
        };
      }
      throw error; // Re-throw to be caught by the outer handler
    }
    let parsedResult;

    try {
      // Clean the response text from any markdown formatting
      const cleanedResponse = cleanMarkdownFormatting(responseText);
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      console.error('Response text:', responseText);

      // Attempt to extract summary and tags from non-JSON response
      const summaryMatch = responseText.match(/summary["\s:]+([^"]+)/i);
      const tagsMatch = responseText.match(/tags["\s:]+\[(.*?)\]/i);

      parsedResult = {
        summary: summaryMatch ? summaryMatch[1].trim() : 'Failed to generate summary',
        tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) : []
      };
    }

    return {
      summary: parsedResult.summary || 'Failed to generate summary',
      tags: Array.isArray(parsedResult.tags) ? parsedResult.tags : []
    };
  } catch (error) {
    console.error('Error generating summary with LLM:', error);
    return {
      summary: 'Failed to generate summary',
      tags: ['error', 'processing_failed']
    };
  }
}

/**
 * Process text with a custom prompt using LLM
 */
async function processWithCustomPrompt(extractedText, prompt) {
  try {
    // Limit text length to avoid token limits
    const limitedText = extractedText.substring(0, 8000);
    
    // Use the provided prompt with the extracted text
    const fullPrompt = prompt.replace('${extractedText}', limitedText);
    
    // Call Google Gemini API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest"
    });
    
    let responseText;
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      responseText = response.text().trim();
    } catch (error) {
      console.error("Error processing with custom prompt:", error);
      if (error.message && error.message.includes("SAFETY")) {
        return "Content generation blocked due to safety settings";
      }
      throw error;
    }
    
    // Clean the response text from any markdown formatting
    return cleanMarkdownFormatting(responseText);
  } catch (error) {
    console.error('Error processing with custom prompt:', error);
    return 'Failed to process with custom prompt: ' + error.message;
  }
}

/**
 * Clean markdown formatting from text
 * This removes code blocks, backticks, and other markdown formatting
 */
function cleanMarkdownFormatting(text) {
  if (!text) return '';
  
  // Remove markdown code block fences (```json and ```)
  let cleaned = text.replace(/```(?:json|javascript|js)?\s*([\s\S]*?)```/g, '$1');
  
  // Remove any remaining backticks
  cleaned = cleaned.replace(/`/g, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+.*$/gm, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Get MIME type based on document type
 */
function getMimeType(documentType) {
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
