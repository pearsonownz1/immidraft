#!/bin/bash

# Script to open the create-bucket.html guide in the default browser

echo "Opening Supabase Storage Bucket Creation Guide..."

# Determine the operating system and open the HTML file accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open create-bucket.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open create-bucket.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start create-bucket.html
else
    echo "Unable to automatically open the guide. Please open 'create-bucket.html' manually in your browser."
fi

echo "Follow the instructions in the guide to create the 'documents' bucket in your Supabase project."
echo "After creating the bucket, redeploy the application to Vercel to verify the fix."
