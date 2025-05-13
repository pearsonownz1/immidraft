#!/bin/bash

# Get the Supabase URL from the .env file
SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: SUPABASE_URL not found in .env file"
  exit 1
fi

# Extract the project reference from the URL
PROJECT_REF=$(echo $SUPABASE_URL | awk -F// '{print $2}' | awk -F. '{print $1}')

# Open the Supabase SQL editor with the project reference
echo "Opening Supabase SQL Editor..."
open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"

# Copy the SQL to clipboard
cat fix-evaluation-letters-rls.sql | pbcopy

echo "SQL copied to clipboard. Paste it into the SQL editor and run it."
