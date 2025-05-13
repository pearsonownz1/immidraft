#!/bin/bash

# This script opens the ImmidraftAI application for testing document processing

echo "Starting ImmidraftAI application for document processing testing..."

# Start the development server with node polyfill fix
node run-dev-with-node-polyfill-fix.js &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Open the application in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:5183
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:5183
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start http://localhost:5183
else
    echo "Please open http://localhost:5183 in your browser"
fi

echo "ImmidraftAI application is running."
echo "Follow the instructions in HOW-TO-TEST-DOCUMENT-PROCESSING.md to test the document processing functionality."
echo ""
echo "Press Ctrl+C to stop the server when you're done testing."

# Wait for user to press Ctrl+C
wait $SERVER_PID
