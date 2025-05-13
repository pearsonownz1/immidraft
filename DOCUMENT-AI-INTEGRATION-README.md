# Google Cloud Document AI Integration

This document provides detailed information about the Google Cloud Document AI integration for the ImmidraftAI application.

## Overview

The Document AI integration enhances the document processing capabilities of the ImmidraftAI application by leveraging Google Cloud's Document AI service. This integration provides:

- More accurate text extraction from various document types
- Support for complex document formats and layouts
- Improved handling of scanned documents and images containing text
- Enhanced document understanding and analysis

## Architecture

The integration consists of the following components:

1. **CriteriaDocumentUploader Component**: The frontend component that handles document uploads and displays the processed results.
2. **Document Processing Service**: A service that processes documents using Google Cloud Document AI and generates summaries using OpenAI.
3. **API Endpoint**: A serverless function that handles the document processing requests.
4. **Google Cloud Document AI**: The cloud service that extracts text from documents.
5. **OpenAI**: Used for generating summaries and tags from the extracted text.

### Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Upload     │     │   Supabase      │     │   Document      │
│     Document    │────▶│    Storage      │────▶│   Processing    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Display      │     │    Update       │     │  Google Cloud   │
│    Results      │◀────│    Database     │◀────│   Document AI   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │     OpenAI      │
                                                │   (Summaries)   │
                                                └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Google Cloud account with Document AI API enabled
- Google Cloud CLI (gcloud) installed
- OpenAI API key
- Node.js and npm

### Installation

1. Run the setup script:
   ```bash
   ./setup-document-ai-integration.sh
   ```

   This script will:
   - Check if gcloud CLI is installed
   - Log you in to Google Cloud if needed
   - Generate an access token
   - Create a `.env.document-ai` file with the necessary configuration
   - Install the required dependencies

2. Update the `.env.document-ai` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

### Manual Setup

If you prefer to set up the integration manually:

1. Install the required dependencies:
   ```bash
   npm run setup:document-ai
   ```

2. Get a Google Cloud access token:
   ```bash
   gcloud auth login
   gcloud auth print-access-token
   ```

3. Create a `.env.document-ai` file with the following content:
   ```
   # Google Cloud Document AI Configuration
   GOOGLE_CLOUD_PROJECT_ID=602726513834
   DOCUMENT_AI_PROCESSOR_ID=9e624c7085434bd9
   GOOGLE_ACCESS_TOKEN=your-google-access-token
   # Document AI API Endpoint: https://us-documentai.googleapis.com/v1/projects/602726513834/locations/us/processors/9e624c7085434bd9:process

   # OpenAI API Configuration
   OPENAI_API_KEY=your-openai-api-key

   # Vercel Environment Variables
   VERCEL_ENV=development
   NODE_ENV=development
   ```

## Usage

The Document AI integration is used automatically when documents are uploaded through the CriteriaDocumentUploader component. The component will:

1. Upload the document to Supabase Storage
2. Process the document using Google Cloud Document AI
3. Generate a summary and tags using OpenAI
4. Update the document in the database with the extracted text, summary, and tags
5. Display the results in the UI

## API Endpoint

The API endpoint for document processing is located at `/api/process-document`. It accepts POST requests with the following parameters:

- `documentUrl`: The URL of the document to process
- `documentType`: The type of document (e.g., "resume", "support", etc.)
- `documentName`: The name of the document

The endpoint returns:

- `extractedText`: The text extracted from the document
- `summary`: A summary of the document
- `tags`: Tags generated for the document

## Deployment

When deploying to Vercel, make sure to add the following environment variables:

- `GOOGLE_CLOUD_PROJECT_ID`
- `DOCUMENT_AI_PROCESSOR_ID`
- `GOOGLE_ACCESS_TOKEN`
- `OPENAI_API_KEY`

You can use the following command to update the environment variables:

```bash
vercel env add GOOGLE_CLOUD_PROJECT_ID
vercel env add DOCUMENT_AI_PROCESSOR_ID
vercel env add GOOGLE_ACCESS_TOKEN
vercel env add OPENAI_API_KEY
```

## Troubleshooting

### Access Token Expiration

Google Cloud access tokens expire after 1 hour. If you encounter authentication errors, generate a new access token:

```bash
gcloud auth print-access-token
```

Then update the `GOOGLE_ACCESS_TOKEN` in your `.env.document-ai` file or Vercel environment variables.

### Document Processing Errors

If document processing fails, check the following:

1. Ensure the document URL is accessible
2. Verify that the Google Cloud access token is valid
3. Check the document format is supported (PDF, DOCX, JPG, PNG, TIFF)
4. Look for error messages in the browser console or server logs

### API Rate Limits

Both Google Cloud Document AI and OpenAI have rate limits. If you encounter rate limit errors, consider implementing retry logic or reducing the frequency of requests.

## Supported Document Types

The Document AI integration supports the following document types:

- PDF
- DOCX
- JPG/JPEG
- PNG
- TIFF
- HTML
- TXT

## Future Improvements

Potential improvements to the Document AI integration:

1. Implement service account authentication for Google Cloud instead of access tokens
2. Add support for more document types
3. Implement caching to reduce API calls
4. Add more advanced document analysis features
5. Implement batch processing for multiple documents
