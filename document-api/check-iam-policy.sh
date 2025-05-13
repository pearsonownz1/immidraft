#!/bin/bash

# Configuration
PROJECT_ID="original-nation-459118-a4"
REGION="us-central1"
SERVICE_NAME="document-ai-api"

echo "Checking IAM policy for Cloud Run service: $SERVICE_NAME"
echo "=============================================="

# Get the IAM policy for the Cloud Run service
gcloud run services get-iam-policy $SERVICE_NAME \
  --region=$REGION \
  --format=json

echo "=============================================="
echo "Checking if service is public:"
gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="value(status.url)"
