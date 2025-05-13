# Azure Document Intelligence Integration

This document provides instructions for setting up and using Azure Document Intelligence (formerly Form Recognizer) with the document-api service.

## Overview

Azure Document Intelligence is a cloud-based AI service that extracts text, key-value pairs, tables, and structure from documents. It can process various document types including PDFs, images, and more.

We've integrated Azure Document Intelligence into our document-api service to replace Google Document AI for OCR and text extraction from uploaded documents.

## Prerequisites

1. An Azure account with an active subscription
2. An Azure Document Intelligence resource (formerly Form Recognizer)
3. Node.js installed on your machine

## Setup Instructions

### 1. Create an Azure Document Intelligence Resource

If you don't already have an Azure Document Intelligence resource:

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Document Intelligence" and select it
4. Click "Create"
5. Fill in the required details:
   - Subscription: Select your Azure subscription
   - Resource group: Create a new one or use an existing one
   - Region: Select a region close to your users
   - Name: Give your resource a unique name
   - Pricing tier: Select a tier (Free tier is available for testing)
6. Click "Review + create" and then "Create"
7. Once deployment is complete, go to the resource
8. In the left menu, click on "Keys and Endpoint"
9. Note down the "Endpoint" and one of the "Keys" (either Key 1 or Key 2)

### 2. Configure the document-api Service

1. Navigate to the document-api directory:
   ```
   cd document-api
   ```

2. Run the setup script:
   ```
   ./setup-azure-document-intelligence.sh
   ```

3. When prompted, enter your Azure Document Intelligence endpoint and key

### 3. Deploy the Service

1. Make the deployment script executable:
   ```
   chmod +x deploy-azure-document-intelligence.sh
   ```

2. Run the deployment script:
   ```
   ./deploy-azure-document-intelligence.sh
   ```

3. The service will start on port 8080

## Testing the Integration

1. Make the test script executable:
   ```
   chmod +x test-azure-document-intelligence.js
   ```

2. Run the test script:
   ```
   node test-azure-document-intelligence.js
   ```

3. The script will send a sample PDF document to the API and display the results

## API Usage

The document-api service exposes an endpoint for processing documents:

- **Endpoint**: `POST /process-document`
- **Request Body**:
  ```json
  {
    "documentUrl": "URL or data URL of the document",
    "documentName": "Name of the document (optional)",
    "documentType": "Type of document (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "documentName": "Name of the document",
    "documentType": "Detected document type",
    "summary": "Summary of the document",
    "tags": ["tag1", "tag2", ...],
    "extractedText": "Full text extracted from the document"
  }
  ```

## Troubleshooting

If you encounter issues with the Azure Document Intelligence integration:

1. Check that your Azure Document Intelligence endpoint and key are correct in the `.env` file
2. Ensure your Azure Document Intelligence resource is active and not experiencing any service disruptions
3. Check the document format - Azure Document Intelligence works best with PDF, JPEG, PNG, BMP, and TIFF formats
4. For large documents, be aware of the request size limits and processing time

## Additional Resources

- [Azure Document Intelligence Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [Azure Document Intelligence API Reference](https://learn.microsoft.com/en-us/rest/api/aiservices/document-intelligence/analyze-document)
- [Azure Document Intelligence Pricing](https://azure.microsoft.com/en-us/pricing/details/form-recognizer/)
