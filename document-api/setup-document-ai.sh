#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}       # Default region, can be overridden by second argument
LOCATION="us"                    # Document AI location (us or eu)
PROCESSOR_TYPE="FORM_PARSER_PROCESSOR"  # Document AI processor type

echo "Setting up Document AI for Google Cloud Project"
echo "=============================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Document AI Location: $LOCATION"
echo "Processor Type: $PROCESSOR_TYPE"
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

# Create a Document AI processor
echo "Creating a Document AI processor..."
echo "Note: We'll use a hardcoded processor ID since we can't list or create processors via CLI"
echo "You can create processors in the Google Cloud Console: https://console.cloud.google.com/ai/document-ai/processors"

# Use a hardcoded processor ID for now
PROCESSOR_ID="9e624c7085434bd9"
  
echo "Processor ID: $PROCESSOR_ID"

# Create or update .env file with processor information
echo "Updating environment variables..."
cat > .env.local << EOF
GCP_PROJECT_ID=$PROJECT_ID
GCP_LOCATION=$LOCATION
GCP_PROCESSOR_ID=$PROCESSOR_ID
EOF

echo "Environment variables saved to .env.local"

echo "=============================================="
echo "Document AI setup complete!"
echo "Project ID: $PROJECT_ID"
echo "Processor ID: $PROCESSOR_ID"
echo ""
echo "Next steps:"
echo "1. Deploy the API to Cloud Run:"
echo "   ./deploy.sh $PROJECT_ID $REGION $PROCESSOR_ID"
echo "=============================================="
