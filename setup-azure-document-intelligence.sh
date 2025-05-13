#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Azure Document Intelligence integration...${NC}"

# Check if .env file exists, create if not
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    touch .env
fi

# Check if document-api/.env file exists, create if not
if [ ! -d document-api ]; then
    echo -e "${YELLOW}Creating document-api directory...${NC}"
    mkdir -p document-api
fi

if [ ! -f document-api/.env ]; then
    echo -e "${YELLOW}Creating document-api/.env file...${NC}"
    touch document-api/.env
fi

# Install required dependencies
echo -e "${YELLOW}Installing required dependencies...${NC}"
npm install @azure/ai-form-recognizer openai node-fetch dotenv

# Prompt for Azure Document Intelligence credentials
echo -e "${YELLOW}Please enter your Azure Document Intelligence credentials:${NC}"
read -p "Azure Document Intelligence Endpoint (e.g., https://your-resource.cognitiveservices.azure.com/): " AZURE_ENDPOINT
read -p "Azure Document Intelligence API Key: " AZURE_KEY
read -p "Azure Document Intelligence Region (e.g., eastus): " AZURE_REGION
read -p "OpenAI API Key (for summary generation): " OPENAI_API_KEY

# Save credentials to .env files
echo -e "${YELLOW}Saving credentials to .env files...${NC}"

# Update root .env file
if grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=.*|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT|g" .env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT" >> .env
fi

if grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_KEY=.*|AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY|g" .env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY" >> .env
fi

if grep -q "AZURE_DOCUMENT_INTELLIGENCE_REGION" .env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_REGION=.*|AZURE_DOCUMENT_INTELLIGENCE_REGION=$AZURE_REGION|g" .env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_REGION=$AZURE_REGION" >> .env
fi

if grep -q "OPENAI_API_KEY" .env; then
    sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|g" .env
else
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
fi

# Update document-api/.env file
if grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" document-api/.env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=.*|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT|g" document-api/.env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT" >> document-api/.env
fi

if grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" document-api/.env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_KEY=.*|AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY|g" document-api/.env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY" >> document-api/.env
fi

if grep -q "AZURE_DOCUMENT_INTELLIGENCE_REGION" document-api/.env; then
    sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_REGION=.*|AZURE_DOCUMENT_INTELLIGENCE_REGION=$AZURE_REGION|g" document-api/.env
else
    echo "AZURE_DOCUMENT_INTELLIGENCE_REGION=$AZURE_REGION" >> document-api/.env
fi

if grep -q "OPENAI_API_KEY" document-api/.env; then
    sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|g" document-api/.env
else
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> document-api/.env
fi

# Make the deploy script executable
chmod +x deploy-to-vercel-with-azure.sh

echo -e "${GREEN}Azure Document Intelligence setup complete!${NC}"
echo -e "${GREEN}You can now run ./deploy-to-vercel-with-azure.sh to deploy your application with Azure Document Intelligence.${NC}"
echo -e "${YELLOW}To test locally, run: npm run dev${NC}"
