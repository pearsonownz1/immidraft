#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Generating Workload Identity Federation credentials for Vercel...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo -e "${YELLOW}gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null
then
    echo -e "${YELLOW}You are not logged in to gcloud. Please run 'gcloud auth login' first.${NC}"
    exit 1
fi

# Set variables
PROJECT_ID="original-nation-459118-a4"
POOL_ID="vercel-pool"
PROVIDER_ID="vercel-provider"
SERVICE_ACCOUNT="document-ai-service-account@original-nation-459118-a4.iam.gserviceaccount.com"
OUTPUT_FILE="google-wif-creds.json"

# Generate the credentials file
echo -e "${YELLOW}Generating credentials file...${NC}"
gcloud iam workload-identity-pools create-cred-config \
  "projects/${PROJECT_ID}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}" \
  --service-account="${SERVICE_ACCOUNT}" \
  --output-file="${OUTPUT_FILE}" \
  --credential-source-type="json" \
  --credential-source-field-name="jwt" \
  --credential-source-file="./.vercel/credentials.json"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully generated credentials file: ${OUTPUT_FILE}${NC}"
    
    # Base64 encode the credentials file for Vercel
    cat "${OUTPUT_FILE}" | base64 > "${OUTPUT_FILE}.base64"
    echo -e "${GREEN}Base64 encoded credentials saved to: ${OUTPUT_FILE}.base64${NC}"
    
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Go to your Vercel project → Settings → Environment Variables"
    echo -e "2. Add a new environment variable:"
    echo -e "   - Key: GOOGLE_WIF_CREDENTIALS_JSON"
    echo -e "   - Value: (paste the content of ${OUTPUT_FILE})"
    echo -e "   - Environment: Production (and optionally Preview & Development)"
    echo -e "   - Type: Secret"
    echo -e "3. Deploy your application to Vercel"
else
    echo -e "${YELLOW}Failed to generate credentials file.${NC}"
    exit 1
fi
