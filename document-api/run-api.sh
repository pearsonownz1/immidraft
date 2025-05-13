#!/bin/bash

# Script to run the document API locally for testing

# Set environment variables
export PORT=8080
export OPENAI_API_KEY=${OPENAI_API_KEY:-"your-openai-api-key"}

# Check if OpenAI API key is set
if [[ "$OPENAI_API_KEY" == "your-openai-api-key" ]]; then
  echo "Warning: OPENAI_API_KEY is not set. The API will use simple summary generation."
  echo "To use OpenAI for summaries, set the OPENAI_API_KEY environment variable."
  echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the API
echo "Starting document OCR API on port $PORT..."
node index.js
