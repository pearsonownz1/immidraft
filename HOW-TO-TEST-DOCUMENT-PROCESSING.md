# How to Test Document Processing in ImmidraftAI

This guide explains how to test the document processing functionality in the ImmidraftAI application.

## Overview

The document processing pipeline extracts text from uploaded documents, generates AI-powered summaries, and creates tags. This information is then used to create more contextually relevant expert letters.

## Testing in the Application UI

1. **Access a Case**:
   - Log in to the application
   - Navigate to the dashboard
   - Click on an existing case or create a new one

2. **Add a Document**:
   - In the case view, select a document category from the left sidebar (e.g., "1 - Resume")
   - Click the "+" button in the top-right corner of the document section
   - Fill in the document details:
     - Document Type: Select from the dropdown (e.g., "Support Letters")
     - Title: Enter a title for your document
     - Description: Add a description
     - Upload File: (Optional) Upload a PDF or other document file
   - Click "Add Document"

3. **View Document Processing Results**:
   - After adding the document, you'll see it appear in the document list
   - Click "Show details" under the document to expand the details section
   - If document processing was successful, you'll see:
     - AI Summary: A concise summary of the document content
     - AI Tags: Relevant tags extracted from the document
     - Extracted Text: The raw text extracted from the document (first 500 characters)

## What's Happening Behind the Scenes

When you add a document, the following process occurs:

1. The document is saved to the database
2. The document processing service is triggered
3. If a file was uploaded, text is extracted from the file
4. The AI service generates a summary and tags based on the extracted text
5. The document record is updated with the extracted text, summary, and tags
6. The UI displays these processing results when you view the document details

## Troubleshooting

If you don't see the document processing results:

1. Check the browser console for any error messages
2. Ensure the document was added successfully
3. Try refreshing the page and checking the document details again
4. Verify that the document processing service is properly configured

## Browser Compatibility

The document processing functionality works in modern browsers. For PDF text extraction in the browser environment, a mock PDF parser is used to ensure compatibility.
