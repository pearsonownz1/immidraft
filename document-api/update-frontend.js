#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let API_URL = '';
const SRC_DIR = path.join(__dirname, '..', 'src');
const SERVICES_DIR = path.join(SRC_DIR, 'services');
const DOCUMENT_PROCESSING_SERVICE_PATH = path.join(SERVICES_DIR, 'documentProcessingService.ts');

console.log('Updating frontend to use Cloud Run Document AI API');
console.log('==================================================');

// Function to prompt for API URL
function promptForApiUrl() {
  return new Promise((resolve) => {
    rl.question('Enter the Cloud Run API URL (e.g., https://document-ai-api-abc123-uc.a.run.app): ', (answer) => {
      API_URL = answer.trim();
      resolve();
    });
  });
}

// Function to update the document processing service
function updateDocumentProcessingService() {
  if (!fs.existsSync(DOCUMENT_PROCESSING_SERVICE_PATH)) {
    console.error(`Document processing service file not found at: ${DOCUMENT_PROCESSING_SERVICE_PATH}`);
    return false;
  }

  try {
    // Read the current file
    const currentContent = fs.readFileSync(DOCUMENT_PROCESSING_SERVICE_PATH, 'utf8');
    
    // Create backup
    const backupPath = `${DOCUMENT_PROCESSING_SERVICE_PATH}.backup`;
    fs.writeFileSync(backupPath, currentContent);
    console.log(`Backup created at: ${backupPath}`);
    
    // Create the updated content
    const updatedContent = `// Document Processing Service using Google Cloud Document AI API
import { supabaseClient } from '../lib/supabase';

// Cloud Run Document AI API URL
const DOCUMENT_AI_API_URL = '${API_URL}';

/**
 * Process a document using Google Cloud Document AI
 * @param documentUrl URL of the document to process
 * @param documentName Name of the document
 * @param documentType Type of document (e.g., 'resume', 'invoice', etc.)
 * @returns Processed document data including extracted text, summary, and tags
 */
export async function processDocument(documentUrl, documentName, documentType = 'resume') {
  try {
    console.log('Processing document with Document AI API:', documentUrl);
    
    // Call the Document AI API
    const response = await fetch(\`\${DOCUMENT_AI_API_URL}/process-document\`, {
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
      throw new Error(\`Document AI API error: \${errorData.error || response.statusText}\`);
    }
    
    const data = await response.json();
    
    // Return the processed document data
    return {
      success: true,
      documentName: data.documentName,
      documentType: data.documentType,
      extractedText: data.extractedText,
      summary: data.summary,
      tags: data.tags || [],
    };
  } catch (error) {
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
export async function uploadAndProcessDocument(file, bucketName = 'documents', documentType = 'resume') {
  try {
    // Upload file to Supabase Storage
    const fileName = \`\${Date.now()}-\${file.name}\`;
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from(bucketName)
      .upload(fileName, file);
    
    if (uploadError) {
      throw new Error(\`Error uploading file: \${uploadError.message}\`);
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    // Process the document using Document AI
    const processResult = await processDocument(publicUrl, file.name, documentType);
    
    return {
      ...processResult,
      fileName,
      publicUrl,
    };
  } catch (error) {
    console.error('Error uploading and processing document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
`;
    
    // Write the updated content
    fs.writeFileSync(DOCUMENT_PROCESSING_SERVICE_PATH, updatedContent);
    console.log(`Updated document processing service at: ${DOCUMENT_PROCESSING_SERVICE_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Error updating document processing service:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Prompt for API URL
    await promptForApiUrl();
    
    if (!API_URL) {
      console.error('API URL is required');
      rl.close();
      return;
    }
    
    console.log(`Using API URL: ${API_URL}`);
    
    // Update document processing service
    const success = updateDocumentProcessingService();
    
    if (success) {
      console.log('==================================================');
      console.log('Frontend updated successfully!');
      console.log('The application now uses the Cloud Run Document AI API.');
      console.log('==================================================');
    } else {
      console.error('Failed to update frontend');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
