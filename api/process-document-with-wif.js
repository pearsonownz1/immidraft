// Vercel Serverless Function for Document Processing with Google Cloud Document AI and LLM
// Using Workload Identity Federation for authentication

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import OpenAI from 'openai';
import fetch from 'node-fetch';

// Initialize OpenAI with v4 SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to decode and use the credentials
function getCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }
  
  try {
    // Decode the base64-encoded credentials
    const decodedCredentials = Buffer.from(credentialsJson, 'base64').toString('utf-8');
    return JSON.parse(decodedCredentials);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format');
  }
}

// Initialize the Document AI client with workload identity federation
let documentAiClient;
try {
  documentAiClient = new DocumentProcessorServiceClient({
    credentials: getCredentials()
  });
} catch (error) {
  console.error('Error initializing Document AI client:', error);
}

/**
 * Main handler for the API endpoint
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request body for debugging
    console.log('Process Document Request:', JSON.stringify(req.body, null, 2));
    
    const { documentUrl, documentType, documentName } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ error: 'Document URL is required' });
    }
    
    // Validate the URL
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

    try {
      // Download document from URL
      const documentBuffer = await downloadDocument(documentUrl);
      
      // Process with Document AI
      const extractedText = await processWithDocumentAI(documentBuffer, documentType);
      
      // Generate summary with LLM
      const { summary, tags } = await generateSummaryWithLLM(extractedText, documentType, documentName);
      
      // Return results
      return res.status(200).json({ extractedText, summary, tags });
    } catch (processingError) {
      // Log the specific processing error
      console.error('Document processing error:', processingError);
      
      // Return a structured error response
      return res.status(500).json({ 
        error: 'Document processing failed',
        message: processingError.message,
        step: processingError.step || 'unknown',
        details: processingError.details || null
      });
    }
  } catch (error) {
    // Log the general handler error
    console.error('Error in process-document handler:', error);
    
    // Always return a properly formatted JSON response
    return res.status(500).json({ 
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
    // Handle Supabase storage URLs
    if (url.includes('supabase') || url.includes('storage')) {
      // Extract the file path from the URL
      const filePath = url.split('/').pop();
      
      // If using Supabase client, you could use:
      // const { data, error } = await supabase.storage.from('documents').download(filePath);
      // return Buffer.from(await data.arrayBuffer());
      
      // For this example, we'll use fetch
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
    } else {
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
    }
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
 * Process document with Google Cloud Document AI using Workload Identity Federation
 */
async function processWithDocumentAI(documentBuffer, documentType) {
  try {
    if (!documentAiClient) {
      throw new Error('Document AI client not initialized');
    }

    // Determine MIME type based on document type
    const mimeType = getMimeType(documentType);
    
    // Prepare the request
    const name = `projects/602726513834/locations/us/processors/9e624c7085434bd9`;
    
    // Convert buffer to base64
    const encodedDocument = documentBuffer.toString('base64');
    
    // Create the request
    const request = {
      name,
      rawDocument: {
        content: encodedDocument,
        mimeType,
      }
    };
    
    console.log(`Making Document AI request for document type: ${documentType}, mime type: ${mimeType}`);
    
    // Process the document
    const [result] = await documentAiClient.processDocument(request);
    
    if (!result.document || !result.document.text) {
      const error = new Error('Document AI response missing expected text field');
      error.step = 'document_ai_response_validation';
      error.details = { responseKeys: Object.keys(result).join(', ') };
      throw error;
    }
    
    // Extract text from the document
    const extractedText = result.document.text;
    
    return extractedText;
  } catch (error) {
    console.error('Error processing document with Document AI:', error);
    
    // Add step information if not already present
    if (!error.step) {
      error.step = 'document_ai';
    }
    
    // If Document AI processing fails, fall back to a simple text extraction
    console.log('Document AI processing failed, falling back to simple text extraction');
    
    // If it's a PDF, we can't do much without Document AI
    if (mimeType === 'application/pdf') {
      return `Failed to extract text from PDF document. Document AI processing error: ${error.message}`;
    }
    
    // For text-based documents, we can try to extract text directly
    try {
      // Convert buffer to string for text-based documents
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
      
      Format your response as JSON:
      {
        "summary": "your summary here",
        "tags": ["tag1", "tag2", "tag3"]
      }
    `;
    
    // Call OpenAI API with v4 SDK
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo" for lower cost
      messages: [
        { role: "system", content: "You are an expert immigration document analyzer." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Parse the response (v4 SDK has different response format)
    const responseText = response.choices[0].message.content.trim();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      
      // Attempt to extract summary and tags from non-JSON response
      const summaryMatch = responseText.match(/summary["\s:]+([^"]+)/i);
      const tagsMatch = responseText.match(/tags["\s:]+\[(.*?)\]/i);
      
      result = {
        summary: summaryMatch ? summaryMatch[1].trim() : 'Failed to generate summary',
        tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) : []
      };
    }
    
    return {
      summary: result.summary || 'Failed to generate summary',
      tags: Array.isArray(result.tags) ? result.tags : []
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
