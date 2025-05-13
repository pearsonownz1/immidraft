#!/bin/bash

# Script to run the document API test

# Set environment variables
export API_URL=${API_URL:-"http://localhost:8080"}
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

# Check if the API is running
echo "Checking if the API is running at $API_URL..."
if ! curl -s --connect-timeout 5 "$API_URL" > /dev/null; then
  echo "Warning: API is not running at $API_URL"
  echo "Starting the API in the background..."
  
  # Start the API in the background
  ./run-api.sh &
  API_PID=$!
  
  # Wait for the API to start
  echo "Waiting for the API to start..."
  for i in {1..10}; do
    if curl -s --connect-timeout 2 "$API_URL" > /dev/null; then
      echo "API is now running!"
      break
    fi
    
    if [ $i -eq 10 ]; then
      echo "Error: Failed to start the API"
      kill $API_PID 2>/dev/null
      exit 1
    fi
    
    echo "Waiting... ($i/10)"
    sleep 2
  done
else
  echo "API is already running at $API_URL"
fi

# Run the test
echo "Running document API test..."
node test-api.js

echo "Test completed!"
