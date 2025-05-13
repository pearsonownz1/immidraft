#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Google Cloud Service Account Key for Vercel...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo -e "${RED}gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null
then
    echo -e "${RED}You are not logged in to gcloud. Please run 'gcloud auth login' first.${NC}"
    exit 1
fi

# Set variables
PROJECT_ID="original-nation-459118-a4"
SERVICE_ACCOUNT="document-ai-service-account@original-nation-459118-a4.iam.gserviceaccount.com"
KEY_FILE="document-ai-service-account-key.json"

# Create service account key
echo -e "${YELLOW}Creating service account key...${NC}"
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account="${SERVICE_ACCOUNT}" \
  --project="${PROJECT_ID}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create service account key.${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully created service account key: ${KEY_FILE}${NC}"

# Base64 encode the key file
echo -e "${YELLOW}Base64 encoding the key file...${NC}"
ENCODED_KEY=$(cat "${KEY_FILE}" | base64)
echo "${ENCODED_KEY}" > "${KEY_FILE}.base64"
echo -e "${GREEN}Base64 encoded key saved to: ${KEY_FILE}.base64${NC}"

# Update the Vercel environment variable
echo -e "${YELLOW}Updating Vercel environment variables...${NC}"

# Check if vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Setting GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable...${NC}"
    vercel env rm GOOGLE_APPLICATION_CREDENTIALS_JSON production -y || true
    vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production <<< "${ENCODED_KEY}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully updated GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.${NC}"
    else
        echo -e "${RED}Failed to update environment variable.${NC}"
        echo -e "${YELLOW}Please manually add the service account key to your Vercel project:${NC}"
        echo -e "1. Go to your Vercel project → Settings → Environment Variables"
        echo -e "2. Add a new environment variable:"
        echo -e "   - Key: GOOGLE_APPLICATION_CREDENTIALS_JSON"
        echo -e "   - Value: (paste the content of ${KEY_FILE}.base64)"
        echo -e "   - Environment: Production (and optionally Preview & Development)"
        echo -e "   - Type: Secret"
    fi
else
    echo -e "${YELLOW}Vercel CLI not found. Please manually add the service account key to your Vercel project:${NC}"
    echo -e "1. Go to your Vercel project → Settings → Environment Variables"
    echo -e "2. Add a new environment variable:"
    echo -e "   - Key: GOOGLE_APPLICATION_CREDENTIALS_JSON"
    echo -e "   - Value: (paste the content of ${KEY_FILE}.base64)"
    echo -e "   - Environment: Production (and optionally Preview & Development)"
    echo -e "   - Type: Secret"
fi

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Deploy your application to Vercel:"
echo -e "   ./deploy-to-vercel.sh"
echo -e ""
echo -e "${RED}IMPORTANT SECURITY NOTE:${NC}"
echo -e "Service account keys are long-lived credentials that should be rotated regularly."
echo -e "Consider implementing a key rotation policy or exploring alternative authentication methods."
