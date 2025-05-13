#!/bin/bash

# Deploy Azure Document Intelligence
# This script deploys the document-api service with Azure Document Intelligence

echo "Deploying document-api with Azure Document Intelligence..."
echo "--------------------------------------------------------"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup-azure-document-intelligence.sh first."
  exit 1
fi

# Check if Azure Document Intelligence credentials are set
if ! grep -q "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" .env || ! grep -q "AZURE_DOCUMENT_INTELLIGENCE_KEY" .env; then
  echo "Error: Azure Document Intelligence credentials not found in .env file."
  echo "Please run setup-azure-document-intelligence.sh first."
  exit 1
fi

# Check if the server is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
  echo "Stopping existing server on port 8080..."
  kill $(lsof -t -i:8080) || true
  sleep 2
fi

# Start the server
echo "Starting document-api server with Azure Document Intelligence..."
node index.js &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "API is now running at http://localhost:8080"
echo ""
echo "To test the API, run: node test-azure-document-intelligence.js"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for the server to be killed
wait $SERVER_PID
