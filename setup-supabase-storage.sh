#!/bin/bash

# Script to set up Supabase storage bucket and RLS policies

echo "Setting up Supabase storage for document uploads..."
echo "======================================================"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create a .env file with your Supabase credentials."
  echo "You can copy .env.example and update it with your Supabase URL and anon key."
  exit 1
fi

# Step 1: Create the storage bucket
echo "Step 1: Creating storage bucket..."
node create-storage-bucket.js

# Check if the previous command was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to create storage bucket. Please check the error message above."
  exit 1
fi

echo ""
echo "Step 2: Setting up RLS policies..."
node setup-storage-rls.js

# Check if the previous command was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to set up RLS policies. Please check the error message above."
  exit 1
fi

echo ""
echo "======================================================"
echo "Supabase storage setup complete!"
echo "You can now upload documents to the 'documents' bucket."
echo ""
echo "If you're still seeing 'Bucket not found' errors in the application:"
echo "1. Make sure you're using the correct Supabase project"
echo "2. Check that your .env file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
echo "3. Restart your development server"
echo "======================================================"
