#!/bin/bash

# Configuration
PROJECT_ID="original-nation-459118-a4"
REGION="us-central1"
SERVICE_NAME="document-ai-api"

echo "Making Cloud Run service public: $SERVICE_NAME"
echo "=============================================="

# Add the allUsers principal to the IAM policy for the Cloud Run service
gcloud run services add-iam-policy-binding $SERVICE_NAME \
  --region=$REGION \
  --member="allUsers" \
  --role="roles/run.invoker"

echo "=============================================="
echo "Checking if service is public:"
gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="value(status.url)"
