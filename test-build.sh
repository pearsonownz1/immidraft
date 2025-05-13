#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing build process locally...${NC}"

# Clean up previous build
if [ -d "dist" ]; then
    echo -e "${YELLOW}Removing previous build...${NC}"
    rm -rf dist
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Run the build
echo -e "${YELLOW}Building project...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
    
    # Count files in dist directory
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${GREEN}Generated $FILE_COUNT files in the dist directory.${NC}"
    
    # List main files
    echo -e "${YELLOW}Main files in dist directory:${NC}"
    find dist -maxdepth 1 -type f | sort
    
    # Check for index.html
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}index.html found in dist directory.${NC}"
    else
        echo -e "${RED}Warning: index.html not found in dist directory.${NC}"
    fi
    
    # Serve the build locally
    echo -e "\n${YELLOW}Would you like to preview the build locally? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Starting local server...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server when done.${NC}"
        npx serve -s dist
    fi
else
    echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Build test completed!${NC}"
echo -e "${YELLOW}If the build looks good, you can deploy to Vercel using:${NC}"
echo -e "${GREEN}./deploy-to-vercel.sh${NC}"
