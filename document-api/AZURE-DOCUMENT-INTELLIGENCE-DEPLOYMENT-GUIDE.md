# Azure Document Intelligence Deployment Guide

This guide explains how to deploy the document processing API with Azure Document Intelligence to Google Cloud Run.

## Prerequisites

1. Azure Document Intelligence (Form Recognizer) service set up in Azure
2. Google Cloud account with billing enabled
3. Google Cloud CLI (`gcloud`) installed and configured
4. Node.js and npm installed

## Setup Steps

### 1. Configure Azure Document Intelligence Credentials

First, set up your Azure Document Intelligence credentials:

```bash
cd document-api
./setup-azure-document-intelligence.sh
```

This script will prompt you for your Azure Document Intelligence endpoint and API key, and save them to the `.env` file.

### 2. Test Locally

Before deploying to the cloud, test the API locally to ensure it works with Azure Document Intelligence:

```bash
cd document-api
./deploy-azure-document-intelligence.sh
```

This will start the API server locally. You can test it by opening the test page:

```bash
cd ..
./open-test-azure-document-intelligence.sh
```

### 3. Deploy to Google Cloud Run

Once you've confirmed that the API works locally with Azure Document Intelligence, you can deploy it to Google Cloud Run:

```bash
cd document-api
./deploy-to-cloud-run-with-azure.sh
```

This script will:
1. Check for Azure Document Intelligence credentials in the `.env` file
2. Deploy the API to Google Cloud Run
3. Configure the necessary environment variables
4. Make the service publicly accessible
5. Provide the service URL for testing

### 4. Update Frontend Configuration

After deploying, you'll need to update your frontend application to use the new API endpoint. The deployment script will ask if you want to update the frontend automatically.

If you choose to update manually, you'll need to set the API endpoint in your frontend code to the service URL provided by the deployment script.

## Troubleshooting

### API Returns Empty Results

If the API returns empty results, check:
1. Azure Document Intelligence credentials are correct
2. The document format is supported (PDF, DOCX, images)
3. The document is accessible via the URL provided

### CORS Issues

If you encounter CORS issues, ensure that your frontend domain is included in the CORS configuration in `document-api/index.js`.

### Deployment Failures

If deployment fails, check:
1. Google Cloud billing is enabled
2. You have the necessary permissions to deploy to Cloud Run
3. The required APIs are enabled in your Google Cloud project

## Additional Resources

- [Azure Document Intelligence Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
