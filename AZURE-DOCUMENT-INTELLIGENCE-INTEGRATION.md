# Azure Document Intelligence Integration

This document provides information about the integration of Azure Document Intelligence into the Immidraft application for document processing and text extraction.

## Overview

Azure Document Intelligence (formerly Form Recognizer) is a cloud-based AI service that uses machine learning to extract text, key-value pairs, tables, and structure from documents. It's used in the Immidraft application to extract text from uploaded documents, which is then processed by OpenAI to generate summaries and tags.

## Setup

The integration has been set up with the following components:

1. **Document API**: A Node.js Express server that handles document processing requests, extracts text using Azure Document Intelligence, and generates summaries using OpenAI.

2. **Frontend Integration**: The frontend application has been updated to use the Document API for document processing.

## Configuration

The Azure Document Intelligence integration is configured using environment variables in the `document-api/.env` file:

```
# Azure Document Intelligence credentials
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://immidraft.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key-here
AZURE_DOCUMENT_INTELLIGENCE_REGION=eastus

# OpenAI API Key (for summary generation)
OPENAI_API_KEY=your-openai-key-here
```

## How It Works

1. **Document Upload**: When a user uploads a document in the Immidraft application, the document is first stored in Supabase Storage.

2. **Document Processing**: The document URL is sent to the Document API, which downloads the document and processes it using Azure Document Intelligence.

3. **Text Extraction**: Azure Document Intelligence extracts text from the document, handling various formats like PDF, DOCX, and images.

4. **Summary Generation**: The extracted text is sent to OpenAI, which generates a summary and identifies relevant tags.

5. **Result**: The extracted text, summary, and tags are returned to the frontend application and displayed to the user.

## Testing

You can test the Azure Document Intelligence integration using the following tools:

1. **API Test**: Run the Document API locally and test it directly:
   ```
   cd document-api
   node index.js
   ```

2. **Test Script**: Use the test script to process a sample document:
   ```
   cd document-api
   node test-azure-document-intelligence.js
   ```

3. **Web Test**: Open the test page in your browser to upload and process documents:
   ```
   ./open-test-azure-document-intelligence.sh
   ```
   (Make sure the frontend development server is running on port 3000)

## Troubleshooting

If you encounter issues with the Azure Document Intelligence integration, check the following:

1. **API Keys**: Ensure that the Azure Document Intelligence API key and endpoint are correctly configured in the `.env` file.

2. **Server Running**: Make sure the Document API server is running on port 8080.

3. **CORS**: If you encounter CORS issues, check that the Document API server is properly configured to allow requests from your frontend application.

4. **Document Format**: Azure Document Intelligence works best with PDF, DOCX, and common image formats. If you're having issues with a specific document, try converting it to a different format.

## Resources

- [Azure Document Intelligence Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [Azure Document Intelligence JavaScript SDK](https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-form-recognizer-readme)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
