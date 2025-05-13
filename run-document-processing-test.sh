#!/bin/bash

# Script to run the document processing test

echo "===== Testing Document Processing Feature ====="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this test."
    exit 1
fi

# Check if required dependencies are installed
echo "Checking for required dependencies..."
MISSING_DEPS=0

# Check for pdf-parse
if ! grep -q "pdf-parse" package.json; then
    echo "Warning: pdf-parse package not found in package.json"
    MISSING_DEPS=1
fi

# Check for mammoth
if ! grep -q "mammoth" package.json; then
    echo "Warning: mammoth package not found in package.json"
    MISSING_DEPS=1
fi

# Check for tesseract.js
if ! grep -q "tesseract.js" package.json; then
    echo "Warning: tesseract.js package not found in package.json"
    MISSING_DEPS=1
fi

# Check for unfluff
if ! grep -q "unfluff" package.json; then
    echo "Warning: unfluff package not found in package.json"
    MISSING_DEPS=1
fi

# Check for node-fetch
if ! grep -q "node-fetch" package.json; then
    echo "Warning: node-fetch package not found in package.json"
    MISSING_DEPS=1
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo "Installing missing dependencies..."
    npm install pdf-parse mammoth tesseract.js unfluff node-fetch
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating a sample .env file..."
    echo "VITE_SUPABASE_URL=your_supabase_url" > .env
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
    echo "VITE_OPENAI_API_KEY=your_openai_api_key" >> .env
    echo "Please update the .env file with your actual credentials before running the test."
    exit 1
fi

# Check if required environment variables are set
if ! grep -q "VITE_SUPABASE_URL" .env || ! grep -q "VITE_SUPABASE_ANON_KEY" .env || ! grep -q "VITE_OPENAI_API_KEY" .env; then
    echo "Error: Required environment variables are missing in .env file."
    echo "Please make sure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_OPENAI_API_KEY are set."
    exit 1
fi

# Create test documents directory if it doesn't exist
if [ ! -d "test-documents" ]; then
    echo "Creating test documents directory..."
    mkdir -p test-documents
    
    # Create a sample text file for testing
    echo "Creating sample test documents..."
    echo "This is a sample recommendation letter for John Doe.
    
Dear Immigration Officer,

I am writing to recommend John Doe for the O-1 visa. He has made significant contributions to the field of artificial intelligence.

Sincerely,
Dr. Jane Smith
Professor of Computer Science" > test-documents/sample-letter.txt
    
    echo "Sample test documents created in the test-documents directory."
fi

echo "Step 1: Testing document processing service..."
node test-document-processing.js

echo ""
echo "Note: The Supabase schema has already been updated via the SQL you ran."

echo ""
echo "===== Test Complete ====="
echo ""
echo "Next steps:"
echo "1. Start the development server with 'npm run dev'"
echo "2. Upload documents in the application"
echo "3. Generate expert letters to see the document summaries in action"
echo ""
echo "For more detailed instructions, see HOW-TO-TEST-DOCUMENT-PROCESSING.md"
