#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Vercel (without WIF credentials)...${NC}"

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
    
    if grep -q "OPENAI_API_KEY" .env.document-ai; then
        OPENAI_API_KEY=$(grep "OPENAI_API_KEY" .env.document-ai | cut -d '=' -f2)
        echo -e "${YELLOW}Setting OPENAI_API_KEY environment variable...${NC}"
        vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
    fi
    
    # We're now using the Cloud Run API directly, so we don't need WIF credentials
    echo -e "${YELLOW}Skipping Workload Identity Federation credentials setup...${NC}"
    echo -e "${YELLOW}The frontend will use the Cloud Run API directly.${NC}"
else
    echo -e "${YELLOW}No .env.document-ai file found. Skipping Document AI environment variables.${NC}"
fi

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}Deployment process completed!${NC}"
