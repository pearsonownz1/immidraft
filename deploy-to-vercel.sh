#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Vercel...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Set environment variable to enable Node.js polyfill fix
echo -e "${YELLOW}Enabling Node.js polyfill fix for browser compatibility...${NC}"
export USE_NODE_POLYFILL_FIX=true

# Build the project
echo -e "${YELLOW}Building project...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
else
    echo -e "${YELLOW}Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Check for Document AI environment variables
echo -e "${YELLOW}Checking for Document AI environment variables...${NC}"
if [ -f .env.document-ai ]; then
    echo -e "${GREEN}Found .env.document-ai file. Adding Document AI environment variables to Vercel...${NC}"
    
    # Extract variables from .env.document-ai
    if grep -q "GOOGLE_CLOUD_PROJECT_ID" .env.document-ai; then
        GOOGLE_CLOUD_PROJECT_ID=$(grep "GOOGLE_CLOUD_PROJECT_ID" .env.document-ai | cut -d '=' -f2)
        echo -e "${YELLOW}Setting GOOGLE_CLOUD_PROJECT_ID environment variable...${NC}"
        vercel env add GOOGLE_CLOUD_PROJECT_ID production <<< "$GOOGLE_CLOUD_PROJECT_ID"
    fi
    
    if grep -q "DOCUMENT_AI_PROCESSOR_ID" .env.document-ai; then
        DOCUMENT_AI_PROCESSOR_ID=$(grep "DOCUMENT_AI_PROCESSOR_ID" .env.document-ai | cut -d '=' -f2)
        echo -e "${YELLOW}Setting DOCUMENT_AI_PROCESSOR_ID environment variable...${NC}"
        vercel env add DOCUMENT_AI_PROCESSOR_ID production <<< "$DOCUMENT_AI_PROCESSOR_ID"
    fi
    
    # We're using Workload Identity Federation now, so we don't need GOOGLE_ACCESS_TOKEN
    # if grep -q "GOOGLE_ACCESS_TOKEN" .env.document-ai; then
    #     GOOGLE_ACCESS_TOKEN=$(grep "GOOGLE_ACCESS_TOKEN" .env.document-ai | cut -d '=' -f2)
    #     echo -e "${YELLOW}Setting GOOGLE_ACCESS_TOKEN environment variable...${NC}"
    #     vercel env add GOOGLE_ACCESS_TOKEN production <<< "$GOOGLE_ACCESS_TOKEN"
    # fi
    
    if grep -q "OPENAI_API_KEY" .env.document-ai; then
        OPENAI_API_KEY=$(grep "OPENAI_API_KEY" .env.document-ai | cut -d '=' -f2)
        echo -e "${YELLOW}Setting OPENAI_API_KEY environment variable...${NC}"
        vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
    fi
    
    # Check for Workload Identity Federation credentials
    if [ -f wif-credentials-base64.txt ]; then
        echo -e "${YELLOW}Found Workload Identity Federation credentials. Setting GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable...${NC}"
        GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat wif-credentials-base64.txt)
        vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production <<< "$GOOGLE_APPLICATION_CREDENTIALS_JSON"
    else
        echo -e "${YELLOW}No Workload Identity Federation credentials found. Please run setup-workload-identity-federation.sh first.${NC}"
    fi
else
    echo -e "${YELLOW}No .env.document-ai file found. Skipping Document AI environment variables.${NC}"
fi

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}Deployment process completed!${NC}"
