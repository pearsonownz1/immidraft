#!/bin/bash

# Test script for Azure Document Intelligence integration

echo "Testing Azure Document Intelligence integration..."
echo "=================================================="
echo ""

# Check if the .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run setup-azure-document-intelligence.sh first."
    exit 1
fi

# Check if the required environment variables are set
source .env
if [ -z "$AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT" ] || [ -z "$AZURE_DOCUMENT_INTELLIGENCE_KEY" ]; then
    echo "Error: Azure Document Intelligence credentials not found in .env file."
    echo "Please run setup-azure-document-intelligence.sh to configure your credentials."
    exit 1
fi

# Check if sample PDF exists
SAMPLE_PDF="../public/sample-resume.pdf"
if [ ! -f "$SAMPLE_PDF" ]; then
    echo "Sample PDF not found at $SAMPLE_PDF"
    echo "Using a data URL for testing instead."
    USE_DATA_URL=true
else
    USE_DATA_URL=false
fi

# Start the API server in the background
echo "Starting the document API server..."
npm start &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 5

# Test the API with a sample document
echo "Testing the API with a sample document..."

if [ "$USE_DATA_URL" = true ]; then
    # Use a small text file as a data URL for testing
    echo "Creating a test text file..."
    echo "This is a test document for Azure Document Intelligence." > test-document.txt
    
    # Convert to base64
    BASE64_CONTENT=$(base64 -i test-document.txt)
    DATA_URL="data:text/plain;base64,$BASE64_CONTENT"
    
    # Send the request
    curl -X POST http://localhost:8080/process-document \
        -H "Content-Type: application/json" \
        -d "{\"documentUrl\": \"$DATA_URL\", \"documentName\": \"test-document.txt\", \"documentType\": \"text\"}"
    
    # Clean up
    rm test-document.txt
else
    # Use the sample PDF
    echo "Using sample PDF: $SAMPLE_PDF"
    
    # Get the public URL for the sample PDF
    # For local testing, we'll use a file:// URL
    SAMPLE_PDF_PATH=$(realpath "$SAMPLE_PDF")
    SAMPLE_PDF_URL="file://$SAMPLE_PDF_PATH"
    
    # Send the request
    curl -X POST http://localhost:8080/process-document \
        -H "Content-Type: application/json" \
        -d "{\"documentUrl\": \"$SAMPLE_PDF_URL\", \"documentName\": \"sample-resume.pdf\", \"documentType\": \"pdf\"}"
fi

echo ""
echo ""
echo "Test complete. Check the output above for results."
echo "If you see JSON output with 'success: true', the integration is working correctly."
echo ""

# Stop the server
echo "Stopping the API server..."
kill $SERVER_PID

echo "=================================================="
