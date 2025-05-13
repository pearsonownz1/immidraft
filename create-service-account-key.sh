#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
SERVICE_ACCOUNT_NAME="document-ai-vercel"
SERVICE_ACCOUNT_DISPLAY_NAME="Document AI Vercel Integration"
KEY_FILE="document-ai-service-account-key.json"
BASE64_KEY_FILE="document-ai-service-account-key.json.base64"

echo "Creating service account for Document AI Vercel integration"
echo "=============================================="
echo "Project ID: $PROJECT_ID"
echo "Service Account Name: $SERVICE_ACCOUNT_NAME"
echo "=============================================="

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if service account already exists
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" &>/dev/null; then
  echo "Service account $SERVICE_ACCOUNT_NAME already exists."
else
  # Create service account
  echo "Creating service account $SERVICE_ACCOUNT_NAME..."
  gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="$SERVICE_ACCOUNT_DISPLAY_NAME"
  
  # Wait for the service account to be fully created
  echo "Waiting for service account to be fully created..."
  sleep 10
fi

# Verify service account exists
echo "Verifying service account exists..."
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" &>/dev/null; then
  echo "Error: Service account $SERVICE_ACCOUNT_NAME was not created successfully."
  exit 1
fi

# Grant Document AI API access to the service account
echo "Granting Document AI API access to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/documentai.apiUser"

# Grant Cloud Run invoker role to the service account
echo "Granting Cloud Run invoker role to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

# Create service account key
echo "Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Base64 encode the key file for Vercel
echo "Base64 encoding key file for Vercel..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  base64 -i $KEY_FILE > $BASE64_KEY_FILE
else
  # Linux
  base64 $KEY_FILE > $BASE64_KEY_FILE
fi

# Add the key to Vercel environment variables
echo "Adding service account key to Vercel environment variables..."
cat $KEY_FILE | vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production

echo "=============================================="
echo "Service account and key created successfully!"
echo "Key file: $KEY_FILE"
echo "Base64 encoded key file: $BASE64_KEY_FILE"
echo "=============================================="
echo "The service account key has been added to Vercel environment variables."
echo "You can now deploy the application to Vercel."
echo "=============================================="
