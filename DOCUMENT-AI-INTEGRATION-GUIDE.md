# Document AI Integration Guide

This guide explains how to use the Document AI integration in the ImmidraftAI application.

## Overview

The Document AI integration enhances the document processing pipeline by:
- Extracting text from uploaded documents using Google Cloud Document AI
- Generating AI-powered summaries and tags using OpenAI
- Using this information to create more contextually relevant expert letters

## Components

The Document AI integration consists of the following components:

1. **Document Processing Service**: Extracts text from documents and generates AI-powered summaries
2. **API Endpoint**: Processes documents using Google Cloud Document AI and OpenAI
3. **UI Components**: Displays the extracted text, summaries, and tags

## Testing the Integration

You can test the Document AI integration using the mock implementation:

1. Start the development server: `npm run dev`
2. Navigate to [http://localhost:5185/test-document-ai](http://localhost:5185/test-document-ai)
3. Upload a document using the form
4. The document will be processed by the mock Document AI service
5. The extracted text, summary, and tags will be displayed

## Implementation Details

### Mock Services

For testing and development purposes, the following mock services are provided:

- `mockDocumentAIService.js`: Mock implementation of Google Cloud Document AI
- `mockDocumentProcessingServiceWithAI.ts`: Mock service for processing documents
- `CriteriaDocumentUploaderWithMockAI.tsx`: UI component for uploading and displaying documents

### Production Services

In a production environment, the following services are used:

- `documentProcessingService.ts`: Service for processing documents using the API endpoint
- `api/process-document.js`: API endpoint that uses Google Cloud Document AI and OpenAI
- `CriteriaDocumentUploader.tsx`: UI component for uploading and displaying documents

## Setting Up for Production

To use the Document AI integration in production, you need to:

1. Set up a Google Cloud project with Document AI enabled
2. Create a Document AI processor for text extraction
3. Set up an OpenAI API key for generating summaries and tags
4. Configure the environment variables in `.env.document-ai`
5. Run the setup script: `./setup-document-ai-integration.sh`
6. Deploy the application to Vercel with the Document AI environment variables

### Environment Variables

The following environment variables are required:

```
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
DOCUMENT_AI_PROCESSOR_ID=your-document-ai-processor-id
GOOGLE_ACCESS_TOKEN=your-google-access-token
OPENAI_API_KEY=your-openai-api-key
```

## Using the Document AI Integration

The Document AI integration is used in the following components:

- **CriteriaDocumentUploader**: When a document is uploaded, it is processed by the Document AI service
- **LetterDraftingArea**: The extracted text and summaries are used to generate more contextually relevant expert letters

### Document Processing Flow

1. User uploads a document in the CriteriaDocumentUploader component
2. The document is stored in Supabase Storage
3. The documentProcessingService processes the document using the API endpoint
4. The API endpoint extracts text using Google Cloud Document AI
5. The API endpoint generates a summary and tags using OpenAI
6. The extracted text, summary, and tags are stored in the database
7. The UI is updated to display the extracted text, summary, and tags

## Troubleshooting

If you encounter issues with the Document AI integration, check the following:

1. Make sure the environment variables are correctly set
2. Check the browser console for error messages
3. Check the server logs for error messages
4. Make sure the Google Cloud Document AI API is enabled
5. Make sure the OpenAI API key is valid

## Resources

- [Google Cloud Document AI Documentation](https://cloud.google.com/document-ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
