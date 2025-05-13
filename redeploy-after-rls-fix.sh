#!/bin/bash

# Redeploy the application to Vercel after fixing the RLS policies

echo "Redeploying to Vercel after fixing RLS policies..."

# Run the existing deploy script
./deploy-to-vercel.sh

echo "Deployment complete! The application should now work correctly with the fixed RLS policies."
echo "You can test document uploads in the deployed application."
