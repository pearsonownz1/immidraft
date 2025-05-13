#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${GREEN}$1${NC}"
}

print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

print_error() {
  echo -e "${RED}$1${NC}"
}

print_message "Running Document AI direct test using gcloud CLI authentication..."
print_warning "This test uses your current gcloud CLI authentication to access Document AI."
print_warning "Make sure you're logged in with 'gcloud auth login' and have the necessary permissions."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install it first."
  exit 1
fi

# Check if the test script exists
if [ ! -f "test-document-ai-direct.js" ]; then
  print_error "Test script not found. Please create test-document-ai-direct.js first."
  exit 1
fi

# Check if the sample PDF exists
if [ ! -f "public/sample-resume.pdf" ]; then
  print_warning "Sample PDF not found at public/sample-resume.pdf."
  print_warning "The test will fail unless you provide a sample PDF file."
fi

# Run the test script
print_message "Executing test script..."
node test-document-ai-direct.js

# Check the exit code
if [ $? -eq 0 ]; then
  print_message "Test completed successfully."
else
  print_error "Test failed."
fi
