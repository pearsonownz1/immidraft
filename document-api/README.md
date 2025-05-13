# Document AI API

A serverless API for processing documents using Google Cloud Document AI, deployed on Google Cloud Run.

## Features

- Process documents (PDFs, images) using Google Cloud Document AI
- Extract text from documents
- Generate simple summaries and tags
- Serverless deployment on Google Cloud Run
- No service account keys required - uses Cloud Run's built-in identity

## Prerequisites

- Google Cloud project with billing enabled
- Google Cloud CLI (`gcloud`) installed and authenticated
- Document AI processor created
- Node.js and npm installed (for local development)

## Project Structure

- `index.js` - The main Express server that handles API requests
- `package.json` - Node.js dependencies and scripts
- `Dockerfile` - Container configuration for Cloud Run
- `deploy.sh` - Deployment script for Google Cloud Run
- `test-api.js` - Test script to verify the API is working

## Deployment

### 1. Set up Google Cloud Project

Make sure you have the Google Cloud CLI installed and authenticated:

```bash
gcloud auth login
```

### 2. Deploy to Cloud Run

You have two options for deployment:

#### Option A: Standard Deployment

```bash
cd document-api
./deploy.sh [PROJECT_ID] [REGION] [PROCESSOR_ID]
```

#### Option B: Deployment with Logging Setup (Recommended)

This script also grants necessary logging permissions to view logs:

```bash
cd document-api
./deploy-with-logs.sh [PROJECT_ID] [REGION] [PROCESSOR_ID]
```

Parameters:
- `PROJECT_ID` (optional) - Your Google Cloud project ID (default: original-nation-459118-a4)
- `REGION` (optional) - The region to deploy to (default: us-central1)
- `PROCESSOR_ID` (optional) - Your Document AI processor ID (default: 9e624c7085434bd9)

The script will:
1. Enable required APIs
2. Grant necessary IAM permissions
3. Deploy the service to Cloud Run
4. Output the service URL

### 3. Test the Deployment

After deployment, you have several options to test and monitor the API:

#### Option A: Test with Node.js Script

```bash
cd document-api
API_URL="https://your-service-url" SAMPLE_PDF_URL="https://example.com/sample.pdf" node test-api.js
```

#### Option B: Test with Sample Document (Recommended)

This script automatically fetches the service URL and tests with a sample document:

```bash
cd document-api
./test-with-sample.sh [PROJECT_ID] [REGION] [SAMPLE_URL]
```

#### Option C: Check Service Status and View Logs

```bash
cd document-api
./check-status.sh [PROJECT_ID] [REGION] [LOG_LIMIT]
```

## API Endpoints

### Health Check

```
GET /
```

Response:
```json
{
  "status": "ok",
  "service": "document-ai-api",
  "endpoints": ["/process-document"]
}
```

### Process Document

```
POST /process-document
```

Request body:
```json
{
  "documentUrl": "https://example.com/document.pdf",
  "documentName": "Sample Document",
  "documentType": "resume"
}
```

Response:
```json
{
  "success": true,
  "documentName": "Sample Document",
  "documentType": "resume",
  "summary": "First 200 characters of the document...",
  "tags": ["javascript", "react", "node.js"],
  "extractedText": "Full text extracted from the document..."
}
```

## Local Development

### 1. Install Dependencies

```bash
cd document-api
npm install
```

### 2. Run Locally

```bash
cd document-api
GCP_PROJECT_ID=your-project-id GCP_PROCESSOR_ID=your-processor-id npm start
```

Note: For local development, you'll need to set up application default credentials:

```bash
gcloud auth application-default login
```

## Integrating with Your Application

To integrate this API with your application, make HTTP requests to the deployed Cloud Run service URL. For example:

```javascript
const response = await fetch('https://your-service-url/process-document', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    documentUrl: 'https://example.com/document.pdf',
    documentName: 'Sample Document',
    documentType: 'resume'
  }),
});

const data = await response.json();
console.log('Extracted text:', data.extractedText);
```

## Security Considerations

- The API is deployed with `--allow-unauthenticated` for simplicity. For production use, consider adding authentication.
- The service uses Cloud Run's built-in identity, so no service account keys are needed.
- Document URLs must be publicly accessible or within your Google Cloud project.

## Troubleshooting

### Viewing Logs

If you're having trouble viewing logs, you can grant yourself the necessary permissions:

```bash
cd document-api
./grant-logs-access.sh [PROJECT_ID] [USER_EMAIL]
```

This script grants the following roles:
- `roles/logging.viewer` - Allows viewing logs in the Google Cloud Console
- `roles/logging.viewAccessor` - Allows accessing logs in custom buckets

### Common Issues

1. **Permission Denied**: Make sure the Cloud Run service account has the Document AI API User role.
   ```bash
   ./grant-permissions.sh [PROJECT_ID]
   ```

2. **Document Processing Fails**: Check that the Document AI processor exists and is properly configured.
   ```bash
   gcloud documentai processors list --project=[PROJECT_ID] --location=us
   ```

3. **Service Unavailable**: Check the service status and recent logs.
   ```bash
   ./check-status.sh [PROJECT_ID] [REGION]
   ```
