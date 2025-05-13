#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}       # Default region, can be overridden by second argument
SERVICE_NAME="document-ai-api"
SAMPLE_URL=${3:-"https://storage.googleapis.com/cloud-samples-data/documentai/invoice.pdf"}  # Default sample document URL

echo "Testing Document AI API with Sample Document"
echo "==========================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Sample Document URL: $SAMPLE_URL"
echo "==========================================="

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if the service exists
echo "Checking if service exists..."
if ! gcloud run services describe $SERVICE_NAME --region=$REGION &>/dev/null; then
  echo "❌ Service $SERVICE_NAME not found in region $REGION"
  echo "To deploy the service, run:"
  echo "./deploy-with-logs.sh $PROJECT_ID $REGION"
  exit 1
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "Service URL: $SERVICE_URL"

# Create a temporary file for the request payload
PAYLOAD_FILE=$(mktemp)
cat > $PAYLOAD_FILE << EOF
{
  "documentUrl": "$SAMPLE_URL",
  "documentName": "Sample Invoice",
  "documentType": "invoice"
}
EOF

echo "Request payload:"
cat $PAYLOAD_FILE

# Send the request to the API
echo ""
echo "Sending request to the API..."
echo "This may take a few seconds..."
curl -s -X POST "$SERVICE_URL/process-document" \
  -H "Content-Type: application/json" \
  -d @$PAYLOAD_FILE | jq '.' || {
    echo "❌ Failed to process document. Make sure jq is installed or remove it from the command."
    echo "Raw response:"
    curl -s -X POST "$SERVICE_URL/process-document" \
      -H "Content-Type: application/json" \
      -d @$PAYLOAD_FILE
  }

# Clean up
rm $PAYLOAD_FILE

echo ""
echo "==========================================="
echo "To view logs for this request, run:"
echo "./check-status.sh $PROJECT_ID $REGION 10"
echo "==========================================="
