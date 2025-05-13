#!/bin/bash

# Exit on any error
set -e

echo "==============================================================="
echo "🧪 Testing Cloud Run Document AI API with WIF Authentication"
echo "==============================================================="

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed"
  echo "Please install Node.js and try again"
  exit 1
fi

# Run the test script
echo "Running test script..."
node test-cloud-run-api-with-wif.js

echo "==============================================================="
echo "Test completed!"
echo "==============================================================="
