#!/bin/bash

# Run the Document AI mock test script
# This script tests the Document AI integration with mock services

echo "Running Document AI mock test..."
echo "================================"

# Run the test script with Node.js
node --experimental-specifier-resolution=node --experimental-modules test-document-ai-mock.js

echo "================================"
echo "Test completed."
echo ""
echo "To test the UI integration, run:"
echo "npm run dev"
echo "Then navigate to: http://localhost:5185/test-document-ai"
