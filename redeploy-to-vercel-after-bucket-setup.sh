#!/bin/bash

# Script to redeploy the application to Vercel after setting up the Supabase storage bucket

echo "Redeploying the application to Vercel after Supabase storage bucket setup..."

# Check if the deploy-to-vercel.sh script exists
if [ -f "./deploy-to-vercel.sh" ]; then
  echo "Using existing deploy-to-vercel.sh script..."
  chmod +x ./deploy-to-vercel.sh
  ./deploy-to-vercel.sh
else
  echo "No deploy-to-vercel.sh script found. Using direct Vercel deployment..."
  
  # Check if Vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
  fi
  
  echo "Deploying to Vercel..."
  vercel --prod
fi

echo ""
echo "After deployment is complete, verify that the document upload functionality works correctly."
echo "You can test this by:"
echo "1. Logging into the application"
echo "2. Creating a new case or opening an existing one"
echo "3. Uploading a document to one of the criteria"
echo "4. Verifying that the document is uploaded successfully and can be viewed"
