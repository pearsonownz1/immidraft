#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Google Cloud Document AI integration...${NC}"

# Check if .env.document-ai file exists
if [ ! -f .env.document-ai ]; then
    echo -e "${YELLOW}Creating .env.document-ai file...${NC}"
    cp .env.document-ai.example .env.document-ai
    echo -e "${GREEN}.env.document-ai file created. Please update it with your Google Cloud and OpenAI credentials.${NC}"
else
    echo -e "${GREEN}.env.document-ai file already exists.${NC}"
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null
then
    echo -e "${YELLOW}Google Cloud CLI not found. Please install it from https://cloud.google.com/sdk/docs/install${NC}"
    echo -e "${YELLOW}After installing, run 'gcloud auth login' and 'gcloud auth application-default login'${NC}"
    exit 1
fi

# Get Google Cloud access token
echo -e "${YELLOW}Getting Google Cloud access token...${NC}"
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}Failed to get access token. Please run 'gcloud auth login' and try again.${NC}"
    exit 1
fi

# Update .env.document-ai with access token
echo -e "${YELLOW}Updating .env.document-ai with access token...${NC}"
sed -i.bak "s|GOOGLE_ACCESS_TOKEN=.*|GOOGLE_ACCESS_TOKEN=$ACCESS_TOKEN|g" .env.document-ai
rm .env.document-ai.bak

echo -e "${GREEN}Access token updated in .env.document-ai${NC}"

# Prompt user to update other environment variables
echo -e "${YELLOW}Please update the following environment variables in .env.document-ai:${NC}"
echo -e "${YELLOW}1. GOOGLE_CLOUD_PROJECT_ID - Your Google Cloud project ID${NC}"
echo -e "${YELLOW}2. DOCUMENT_AI_PROCESSOR_ID - Your Document AI processor ID${NC}"
echo -e "${YELLOW}3. OPENAI_API_KEY - Your OpenAI API key${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To test the Document AI integration, run:${NC}"
echo -e "${GREEN}npm run test:document-ai${NC}"
