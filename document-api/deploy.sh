#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}       # Default region, can be overridden by second argument
SERVICE_NAME="document-ai-api"
PROCESSOR_ID=${3:-"9e624c7085434bd9"}  # Default processor ID, can be overridden by third argument

echo "Deploying Document AI API to Google Cloud Run"
echo "=============================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Processor ID: $PROCESSOR_ID"
echo "=============================================="

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
  documentai.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com

# Get the project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"

# Grant Document AI API access to the Cloud Run service account
echo "Granting Document AI API access to Cloud Run service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/documentai.apiUser"

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --set-env-vars=GCP_PROJECT_ID=$PROJECT_ID,GCP_LOCATION=us,GCP_PROCESSOR_ID=$PROCESSOR_ID \
  --allow-unauthenticated

# Get the deployed service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "=============================================="
echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo "Test the API with:"
echo "curl -X POST $SERVICE_URL/process-document \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"documentUrl\": \"https://example.com/sample.pdf\", \"documentName\": \"Sample\", \"documentType\": \"resume\"}'"
echo "=============================================="
