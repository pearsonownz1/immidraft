#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Retrieving Vercel configuration for GitHub Actions setup...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in
echo -e "${YELLOW}Checking Vercel login status...${NC}"
VERCEL_TOKEN=$(vercel whoami 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Not logged in to Vercel. Please login:${NC}"
    vercel login
fi

# Get project info
echo -e "${YELLOW}Fetching project information...${NC}"
PROJECT_INFO=$(vercel project ls --json)

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to fetch project information. Please make sure you're logged in and have projects.${NC}"
    exit 1
fi

# Get token
echo -e "${YELLOW}Retrieving Vercel token...${NC}"
echo -e "${BLUE}Your Vercel token can be found at: ${NC}https://vercel.com/account/tokens"
echo -e "${YELLOW}Create a new token if you don't have one already.${NC}"

# Get org ID
echo -e "\n${YELLOW}Your Vercel Organization ID:${NC}"
ORG_ID=$(echo $PROJECT_INFO | grep -o '"orgId":"[^"]*' | head -1 | sed 's/"orgId":"//')
echo -e "${GREEN}$ORG_ID${NC}"

# List projects for selection
echo -e "\n${YELLOW}Your Vercel Projects:${NC}"
echo "$PROJECT_INFO" | grep -o '"name":"[^"]*","link":"[^"]*' | sed 's/"name":"//;s/","link":"/ - /'

# Get project ID
echo -e "\n${YELLOW}Enter the name of the project you want to deploy:${NC}"
read PROJECT_NAME

PROJECT_ID=$(echo "$PROJECT_INFO" | grep -o "\"name\":\"$PROJECT_NAME\",\"id\":\"[^\"]*" | sed "s/\"name\":\"$PROJECT_NAME\",\"id\":\"//" | head -1)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Project not found. Please check the name and try again.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Your Vercel Project ID for '$PROJECT_NAME':${NC}"
echo -e "${GREEN}$PROJECT_ID${NC}"

# Output GitHub Actions secrets
echo -e "\n${YELLOW}Add these secrets to your GitHub repository:${NC}"
echo -e "${BLUE}VERCEL_TOKEN${NC}: Your Vercel API token from https://vercel.com/account/tokens"
echo -e "${BLUE}VERCEL_ORG_ID${NC}: ${GREEN}$ORG_ID${NC}"
echo -e "${BLUE}VERCEL_PROJECT_ID${NC}: ${GREEN}$PROJECT_ID${NC}"

echo -e "\n${GREEN}Configuration complete! You can now set up GitHub Actions for continuous deployment.${NC}"
