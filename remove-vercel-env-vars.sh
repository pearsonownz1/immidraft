#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Removing WIF and credentials environment variables from Vercel...${NC}"

# Remove GOOGLE_APPLICATION_CREDENTIALS_JSON
echo -e "${YELLOW}Removing GOOGLE_APPLICATION_CREDENTIALS_JSON...${NC}"
echo "y" | vercel env rm GOOGLE_APPLICATION_CREDENTIALS_JSON production

# Remove GOOGLE_WIF_CREDENTIALS_JSON
echo -e "${YELLOW}Removing GOOGLE_WIF_CREDENTIALS_JSON...${NC}"
echo "y" | vercel env rm GOOGLE_WIF_CREDENTIALS_JSON production

echo -e "${GREEN}Environment variables removed successfully!${NC}"
