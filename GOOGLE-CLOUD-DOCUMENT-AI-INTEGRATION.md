# Google Cloud Document AI Integration Plan

## Overview

This document outlines the plan to integrate Google Cloud Document AI for document parsing and text extraction, combined with an LLM for generating summaries and tags. This approach will provide more accurate and reliable document processing capabilities for the ImmidraftAI application.

## Current Architecture

Currently, the document processing pipeline consists of:

1. **Document Upload**: Users upload documents through the CriteriaDocumentUploader component
2. **Text Extraction**: The textExtractionService attempts to extract text using browser-compatible libraries
3. **AI Processing**: The extracted text is processed by the aiService to generate summaries and tags
4. **Database Update**: The document record is updated with extracted text, summary, and tags

## Proposed Architecture with Google Cloud Document AI

### 1. Google Cloud Setup

- Create a Google Cloud Project
- Enable the Document AI API
- Create a service account with appropriate permissions
- Generate and securely store service account credentials

### 2. Backend API Endpoint

Create a secure backend API endpoint to handle document processing:

```
POST /api/process-document
```

This endpoint will:
- Receive the uploaded document
- Send it to Google Cloud Document AI
- Process the response
- Forward the extracted text to an LLM for summarization
- Return the results

### 3. Frontend Integration

Update the document processing service to:
- Upload the document to Supabase storage
- Call the backend API endpoint with the document URL
- Update the document record with the results

### 4. Implementation Steps

#### Step 1: Set Up Google Cloud Document AI

1. Create a Google Cloud project
2. Enable the Document AI API
3. Create a processor for general document parsing
4. Set up a service account with appropriate permissions
5. Download the service account key

#### Step 2: Create Backend API

1. Set up a serverless function (e.g., Vercel Serverless Functions)
2. Implement document processing logic:
   - Receive document from frontend
   - Call Document AI API
   - Process the response
   - Call LLM API for summarization
   - Return results

```javascript
// Example serverless function structure
export default async function handler(req, res) {
  try {
    const { documentUrl, documentType } = req.body;
    
    // Download document from URL
    const documentBuffer = await downloadDocument(documentUrl);
    
    // Process with Document AI
    const extractedText = await processWithDocumentAI(documentBuffer, documentType);
    
    // Generate summary with LLM
    const { summary, tags } = await generateSummaryWithLLM(extractedText, documentType);
    
    // Return results
    res.status(200).json({ extractedText, summary, tags });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
}
```

#### Step 3: Update Frontend Services

1. Update documentProcessingService.ts to call the new API endpoint:

```typescript
async processDocument(documentId: string, fileUrl: string, fileType: string, fileName: string): Promise<any> {
  try {
    console.log(`Processing document: ${documentId}, type: ${fileType}, name: ${fileName}`);
    
    // Call backend API
    const response = await fetch('/api/process-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl: fileUrl,
        documentType: fileType,
        documentName: fileName
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const { extractedText, summary, tags } = await response.json();
    
    // Update the document in the database
    const { data, error } = await supabase
      .from('documents')
      .update({
        extracted_text: extractedText,
        summary: summary,
        ai_tags: tags
      })
      .eq('id', documentId)
      .select();
    
    if (error) {
      console.error('Error updating document with extracted text and summary:', error);
      return null;
    }
    
    console.log(`Document processed successfully: ${documentId}`);
    return data[0];
  } catch (error) {
    console.error('Error processing document:', error);
    return null;
  }
}
```

2. Remove the local text extraction logic since it will be handled by Document AI

#### Step 4: Document AI Implementation

Create a module to interact with Google Cloud Document AI:

```javascript
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

// Create a client
const client = new DocumentProcessorServiceClient();

async function processWithDocumentAI(documentBuffer, documentType) {
  try {
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;
    
    // Convert buffer to base64
    const encodedDocument = Buffer.from(documentBuffer).toString('base64');
    
    const request = {
      name,
      rawDocument: {
        content: encodedDocument,
        mimeType: getMimeType(documentType),
      },
    };
    
    // Process the document
    const [result] = await client.processDocument(request);
    const { document } = result;
    
    // Extract text from the document
    const extractedText = document.text;
    
    return extractedText;
  } catch (error) {
    console.error('Error processing document with Document AI:', error);
    throw error;
  }
}
```

#### Step 5: LLM Integration

Implement LLM-based summarization:

```javascript
async function generateSummaryWithLLM(extractedText, documentType) {
  try {
    // Use OpenAI API or another LLM provider
    const response = await openai.createCompletion({
      model: "gpt-4",
      prompt: `
        You are an expert immigration document analyzer.
        
        Document Type: ${documentType}
        Document Content: ${extractedText.substring(0, 8000)} // Limit text length
        
        Please provide:
        1. A concise summary of this document (max 200 words)
        2. A list of 3-5 relevant tags for this document
        
        Format your response as JSON:
        {
          "summary": "your summary here",
          "tags": ["tag1", "tag2", "tag3"]
        }
      `,
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].text);
    
    return {
      summary: result.summary,
      tags: result.tags
    };
  } catch (error) {
    console.error('Error generating summary with LLM:', error);
    throw error;
  }
}
```

### 5. Environment Variables

Add the following environment variables:

```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
GOOGLE_APPLICATION_CREDENTIALS=path-to-credentials-file
OPENAI_API_KEY=your-openai-api-key
```

### 6. Security Considerations

- Store API keys and credentials securely
- Implement proper authentication for the API endpoint
- Use HTTPS for all API calls
- Implement rate limiting to prevent abuse
- Ensure compliance with data protection regulations

### 7. Testing Plan

1. Unit tests for each component
2. Integration tests for the complete pipeline
3. Test with various document types:
   - PDF documents
   - Word documents
   - Image-based documents (scanned)
   - Documents with different languages
   - Documents with tables and complex formatting

### 8. Fallback Mechanism

Implement a fallback mechanism in case Document AI fails:

```javascript
async function extractText(document, documentType) {
  try {
    // Try Document AI first
    return await processWithDocumentAI(document, documentType);
  } catch (error) {
    console.warn('Document AI failed, falling back to local extraction:', error);
    // Fall back to local extraction
    return await localTextExtraction(document, documentType);
  }
}
```

## Cost Considerations

- Google Cloud Document AI pricing:
  - First 1,000 pages per month: Free
  - $1.50 per 1,000 pages after free tier
- OpenAI API pricing:
  - GPT-4: ~$0.03 per 1,000 tokens
  - GPT-3.5: ~$0.002 per 1,000 tokens

Estimate monthly cost for 5,000 documents (assuming average 5 pages per document):
- Document AI: (25,000 - 1,000) * $1.50 / 1,000 = $36
- OpenAI (GPT-4): ~$75 (estimated)
- Total: ~$111 per month

## Timeline

1. Google Cloud setup: 1 day
2. Backend API implementation: 3 days
3. Frontend integration: 2 days
4. Testing and debugging: 3 days
5. Deployment and monitoring: 1 day

Total estimated time: 10 working days

## Next Steps

1. Create a Google Cloud account if not already available
2. Set up a Document AI processor
3. Implement a proof of concept with a small sample of documents
4. Evaluate accuracy and performance
5. Proceed with full implementation if results are satisfactory
