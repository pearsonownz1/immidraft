#!/bin/bash

# Script to redeploy the application to Vercel after setting up the evaluation letters tables

echo "Redeploying to Vercel after setting up evaluation letters tables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI is not installed. Installing..."
  npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "Deployment complete!"
echo "The EvalLetterAI feature should now be fully functional with database support."
echo ""
echo "You can access the application at your Vercel deployment URL."
