#!/bin/bash
# Script to run the Workload Identity Federation test

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

# Check if the credentials file exists
if [ ! -f "./wif-credentials-base64.txt" ]; then
  print_error "Error: wif-credentials-base64.txt not found."
  print_warning "Please run setup-workload-identity-federation.sh first to generate the credentials."
  exit 1
fi

# Read the base64-encoded credentials
CREDENTIALS=$(cat wif-credentials-base64.txt)

print_message "Running Workload Identity Federation test..."

# Run the test script with the credentials environment variable
GOOGLE_APPLICATION_CREDENTIALS_JSON="$CREDENTIALS" node test-workload-identity-federation.js

# Check the exit code
if [ $? -eq 0 ]; then
  print_message "Test completed."
else
  print_error "Test failed."
fi
