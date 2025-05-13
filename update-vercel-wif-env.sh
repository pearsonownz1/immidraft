#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating Vercel environment variables with URL-based WIF credentials...${NC}"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo -e "${YELLOW}Vercel CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if the credentials file exists
if [ ! -f "google-wif-creds-url.json" ]; then
    echo -e "${YELLOW}Credentials file google-wif-creds-url.json not found. Please run generate-url-wif-credentials.sh first.${NC}"
    exit 1
fi

# Read the credentials file
CREDENTIALS=$(cat google-wif-creds-url.json)

# Update the Vercel environment variable
echo -e "${YELLOW}Setting GOOGLE_WIF_CREDENTIALS_JSON environment variable...${NC}"
vercel env add GOOGLE_WIF_CREDENTIALS_JSON production <<< "$CREDENTIALS"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully updated GOOGLE_WIF_CREDENTIALS_JSON environment variable.${NC}"
    
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Deploy your application to Vercel:"
    echo -e "   ./deploy-to-vercel.sh"
else
    echo -e "${YELLOW}Failed to update environment variable.${NC}"
    exit 1
fi
