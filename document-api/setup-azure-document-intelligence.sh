#!/bin/bash

# Setup Azure Document Intelligence
# This script helps set up Azure Document Intelligence for the document-api service

echo "Setting up Azure Document Intelligence..."
echo "----------------------------------------"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
fi

# Prompt for Azure Document Intelligence endpoint
read -p "Enter your Azure Document Intelligence endpoint (e.g., https://your-resource-name.cognitiveservices.azure.com/): " AZURE_ENDPOINT

# Prompt for Azure Document Intelligence API key
read -p "Enter your Azure Document Intelligence API key: " AZURE_KEY

# Update .env file with Azure Document Intelligence credentials
echo "Updating .env file with Azure Document Intelligence credentials..."

# Check if the variables already exist in the .env file
if grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env; then
  # Replace existing values
  sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=.*|AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT|g" .env
  sed -i '' "s|AZURE_DOCUMENT_INTELLIGENCE_KEY=.*|AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY|g" .env
else
  # Add new values
  echo "" >> .env
  echo "# Azure Document Intelligence (Form Recognizer) credentials" >> .env
  echo "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_ENDPOINT" >> .env
  echo "AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_KEY" >> .env
fi

echo "Azure Document Intelligence credentials updated in .env file."
echo ""

# Make the script executable
chmod +x test-azure-document-intelligence.js

echo "Setup complete!"
echo "To test Azure Document Intelligence, run: node test-azure-document-intelligence.js"
echo ""
echo "To deploy the API with Azure Document Intelligence, run: ./deploy-azure-document-intelligence.sh"
