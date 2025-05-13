#!/bin/bash
# Script to run the Workload Identity Federation test with a mock token for local testing

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

print_warning "This script is for LOCAL TESTING ONLY. It uses a mock Vercel token."
print_warning "In production, the actual Vercel token will be provided by the Vercel environment."
echo ""

# Set a mock Vercel auth token for local testing
export VERCEL_AUTH_BEARER_TOKEN="mock_token_for_local_testing"

print_message "Running Workload Identity Federation test with mock token..."

# Run the test script with the credentials environment variable
GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat wif-credentials-base64.txt) node test-workload-identity-federation.js

# Check the exit code
if [ $? -eq 0 ]; then
  print_message "Test completed."
else
  print_error "Test failed."
  print_warning "Note: This test is expected to fail locally because the mock token is not valid."
  print_warning "The actual authentication will work in the Vercel environment where proper tokens are available."
fi
