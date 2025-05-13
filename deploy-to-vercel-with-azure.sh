#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Vercel with Azure Document Intelligence...${NC}"

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

# Check for Azure Document Intelligence environment variables
echo -e "${YELLOW}Checking for Azure Document Intelligence environment variables...${NC}"

# First check document-api/.env
if [ -f document-api/.env ]; then
    echo -e "${GREEN}Found document-api/.env file. Adding Azure Document Intelligence environment variables to Vercel...${NC}"

    # Extract variables from document-api/.env
    if grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" document-api/.env; then
        AZURE_ENDPOINT=$(grep "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" document-api/.env | cut -d '=' -f2)
        echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT environment variable...${NC}"
        vercel env add AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT production <<< "$AZURE_ENDPOINT"
    fi

    if grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" document-api/.env; then
        AZURE_KEY=$(grep "AZURE_DOCUMENT_INTELLIGENCE_KEY" document-api/.env | cut -d '=' -f2)
        echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_KEY environment variable...${NC}"
        vercel env add AZURE_DOCUMENT_INTELLIGENCE_KEY production <<< "$AZURE_KEY"
    fi

    if grep -q "AZURE_DOCUMENT_INTELLIGENCE_REGION" document-api/.env; then
        AZURE_REGION=$(grep "AZURE_DOCUMENT_INTELLIGENCE_REGION" document-api/.env | cut -d '=' -f2)
        echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_REGION environment variable...${NC}"
        vercel env add AZURE_DOCUMENT_INTELLIGENCE_REGION production <<< "$AZURE_REGION"
    fi

    if grep -q "OPENAI_API_KEY" document-api/.env; then
        OPENAI_API_KEY=$(grep "OPENAI_API_KEY" document-api/.env | cut -d '=' -f2)
        echo -e "${YELLOW}Setting OPENAI_API_KEY environment variable...${NC}"
        vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
    fi
else
    echo -e "${YELLOW}No document-api/.env file found. Checking root .env file...${NC}"
    
    # Check root .env file as fallback
    if [ -f .env ]; then
        echo -e "${GREEN}Found .env file. Adding Azure Document Intelligence environment variables to Vercel...${NC}"

        # Extract variables from .env
        if grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env; then
            AZURE_ENDPOINT=$(grep "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env | cut -d '=' -f2)
            echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT environment variable...${NC}"
            vercel env add AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT production <<< "$AZURE_ENDPOINT"
        fi

        if grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env; then
            AZURE_KEY=$(grep "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env | cut -d '=' -f2)
            echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_KEY environment variable...${NC}"
            vercel env add AZURE_DOCUMENT_INTELLIGENCE_KEY production <<< "$AZURE_KEY"
        fi

        if grep -q "AZURE_DOCUMENT_INTELLIGENCE_REGION" .env; then
            AZURE_REGION=$(grep "AZURE_DOCUMENT_INTELLIGENCE_REGION" .env | cut -d '=' -f2)
            echo -e "${YELLOW}Setting AZURE_DOCUMENT_INTELLIGENCE_REGION environment variable...${NC}"
            vercel env add AZURE_DOCUMENT_INTELLIGENCE_REGION production <<< "$AZURE_REGION"
        fi

        if grep -q "OPENAI_API_KEY" .env; then
            OPENAI_API_KEY=$(grep "OPENAI_API_KEY" .env | cut -d '=' -f2)
            echo -e "${YELLOW}Setting OPENAI_API_KEY environment variable...${NC}"
            vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
        fi
    else
        echo -e "${YELLOW}No .env file found. Please run setup-azure-document-intelligence.sh first.${NC}"
        exit 1
    fi
fi

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${GREEN}Your application is now using Azure Document Intelligence for OCR processing.${NC}"
