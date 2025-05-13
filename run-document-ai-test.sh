#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running Document AI integration test...${NC}"

# Check if .env.document-ai file exists
if [ ! -f .env.document-ai ]; then
    echo -e "${YELLOW}Error: .env.document-ai file not found.${NC}"
    echo -e "${YELLOW}Please run ./setup-document-ai-integration.sh first.${NC}"
    exit 1
fi

# Check if sample-resume.pdf exists
if [ ! -f public/sample-resume.pdf ]; then
    echo -e "${YELLOW}Error: sample-resume.pdf file not found.${NC}"
    echo -e "${YELLOW}Please create a sample PDF file at public/sample-resume.pdf for testing.${NC}"
    exit 1
fi

# Run the test
echo -e "${YELLOW}Running test-document-ai-integration.js...${NC}"
node test-document-ai-integration.js

# Check if the test was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Document AI integration test completed successfully!${NC}"
else
    echo -e "${YELLOW}Document AI integration test failed.${NC}"
    echo -e "${YELLOW}Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}You can now use the Document AI integration in your application.${NC}"
echo -e "${GREEN}To use the Document AI integration in your application, update the documentProcessingService.ts file to use the Document AI API.${NC}"
