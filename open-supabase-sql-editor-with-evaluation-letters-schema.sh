#!/bin/bash

# Script to open the Supabase SQL Editor with the evaluation letters schema SQL script

# Get the Supabase project ID from the .env file
SUPABASE_PROJECT_ID=$(grep SUPABASE_PROJECT_ID .env | cut -d '=' -f2)

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  # Try to get it from the URL in the .env file
  SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
  if [ -n "$SUPABASE_URL" ]; then
    # Extract the project ID from the URL (assuming format like https://nhlvmzurgvkiltpzycyt.supabase.co)
    SUPABASE_PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).supabase.co.*/\1/')
  fi
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Could not find Supabase project ID in .env file."
  echo "Using the default project ID from the SQL script."
  SUPABASE_PROJECT_ID="nhlvmzurgvkiltpzycyt"
fi

# URL to the Supabase SQL Editor
SQL_EDITOR_URL="https://app.supabase.com/project/$SUPABASE_PROJECT_ID/sql"

echo "Opening Supabase SQL Editor..."
echo "Project ID: $SUPABASE_PROJECT_ID"
echo "URL: $SQL_EDITOR_URL"

# Copy the SQL script to clipboard
if command -v pbcopy > /dev/null; then
  # macOS
  cat update-evaluation-letters-schema.sql | pbcopy
  echo "SQL script copied to clipboard. Paste it into the SQL Editor."
elif command -v xclip > /dev/null; then
  # Linux with xclip
  cat update-evaluation-letters-schema.sql | xclip -selection clipboard
  echo "SQL script copied to clipboard. Paste it into the SQL Editor."
elif command -v clip > /dev/null; then
  # Windows
  cat update-evaluation-letters-schema.sql | clip
  echo "SQL script copied to clipboard. Paste it into the SQL Editor."
else
  echo "Could not copy SQL script to clipboard. Please open 'update-evaluation-letters-schema.sql' and copy its contents manually."
fi

# Open the SQL Editor in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "$SQL_EDITOR_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open "$SQL_EDITOR_URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start "$SQL_EDITOR_URL"
else
  echo "Unable to automatically open the SQL Editor. Please open this URL manually in your browser:"
  echo "$SQL_EDITOR_URL"
fi

echo ""
echo "Instructions:"
echo "1. Paste the SQL script into the SQL Editor"
echo "2. Click 'Run' to execute the script"
echo "3. Verify that the tables and policies were created by checking the results"
echo ""
echo "After creating the tables and policies, redeploy the application to Vercel to verify the fix."
