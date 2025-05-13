#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}       # Default region, can be overridden by second argument
SERVICE_NAME="document-ai-api"
LOG_LIMIT=${3:-20}               # Number of log entries to display, can be overridden by third argument

echo "Checking Document AI API Status and Logs"
echo "========================================"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Log Limit: $LOG_LIMIT entries"
echo "========================================"

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if the service exists
echo "Checking if service exists..."
if gcloud run services describe $SERVICE_NAME --region=$REGION &>/dev/null; then
  echo "Service $SERVICE_NAME found in region $REGION"
  
  # Get service details
  echo "Fetching service details..."
  SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
  LATEST_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevision)")
  
  echo "Service URL: $SERVICE_URL"
  echo "Latest Revision: $LATEST_REVISION"
  
  # Check service health
  echo "Checking service health..."
  if curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL | grep -q "200"; then
    echo "✅ Service is responding with HTTP 200 OK"
  else
    echo "⚠️ Service is not responding with HTTP 200 OK"
  fi
  
  # View recent logs
  echo ""
  echo "Recent logs (last $LOG_LIMIT entries):"
  echo "---------------------------------------"
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
    --project=$PROJECT_ID \
    --limit=$LOG_LIMIT \
    --format="table(timestamp.date('%Y-%m-%d %H:%M:%S %Z'), severity, textPayload)"
  
  echo ""
  echo "Document AI processor logs (last $LOG_LIMIT entries):"
  echo "---------------------------------------"
  gcloud logging read "resource.type=documentai.googleapis.com/Processor" \
    --project=$PROJECT_ID \
    --limit=$LOG_LIMIT \
    --format="table(timestamp.date('%Y-%m-%d %H:%M:%S %Z'), severity, textPayload)"
  
  echo ""
  echo "To test the API, run:"
  echo "curl -X POST $SERVICE_URL/process-document \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{\"documentUrl\": \"https://example.com/sample.pdf\", \"documentName\": \"Sample\", \"documentType\": \"resume\"}'"
else
  echo "❌ Service $SERVICE_NAME not found in region $REGION"
  echo "To deploy the service, run:"
  echo "./deploy-with-logs.sh $PROJECT_ID $REGION"
fi

echo "========================================"
