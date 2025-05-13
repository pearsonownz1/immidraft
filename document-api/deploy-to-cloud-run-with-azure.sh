#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}       # Default region, can be overridden by second argument
SERVICE_NAME="document-ai-api"

echo "Deploying Document API with Azure Document Intelligence to Google Cloud Run"
echo "=========================================================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "=========================================================================="

# Check if .env file exists with Azure Document Intelligence credentials
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup-azure-document-intelligence.sh first."
  exit 1
fi

# Check if Azure Document Intelligence credentials are set
if ! grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env || ! grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env; then
  echo "Error: Azure Document Intelligence credentials not found in .env file."
  echo "Please run setup-azure-document-intelligence.sh first."
  exit 1
fi

# Extract Azure Document Intelligence credentials from .env file
AZURE_ENDPOINT=$(grep "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env | cut -d '=' -f2)
AZURE_KEY=$(grep "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env | cut -d '=' -f2)
OPENAI_API_KEY=$(grep "OPENAI_API_KEY" .env | cut -d '=' -f2 || echo "")

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com

# Deploy to Cloud Run
echo "Deploying to Cloud Run with Azure Document Intelligence..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --set-env-vars="AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT,AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY,OPENAI_API_KEY=$OPENAI_API_KEY" \
  --allow-unauthenticated

# Get the deployed service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "=========================================================================="
echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo "Test the API with:"
echo "curl -X POST $SERVICE_URL/process-document \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"documentUrl\": \"https://example.com/sample.pdf\", \"documentName\": \"Sample\", \"documentType\": \"resume\"}'"
echo "=========================================================================="

# Update the frontend to use the new API endpoint
echo "Do you want to update the frontend to use the new API endpoint? (y/n)"
read -r update_frontend

if [[ $update_frontend == "y" || $update_frontend == "Y" ]]; then
  echo "Updating frontend to use the new API endpoint..."
  
  # Check if the update-frontend.js script exists
  if [ -f "update-frontend.js" ]; then
    node update-frontend.js "$SERVICE_URL"
  else
    echo "Warning: update-frontend.js script not found. You'll need to manually update the frontend."
    echo "Set the API endpoint to: $SERVICE_URL"
  fi
fi

echo "Done!"
