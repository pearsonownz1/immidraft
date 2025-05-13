#!/bin/bash

# Open the storage RLS policies HTML file in the default browser

echo "Opening Storage RLS Policies in browser..."

# Determine the OS and use the appropriate command
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open storage-rls-policies.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open storage-rls-policies.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start storage-rls-policies.html
else
  echo "Unsupported OS. Please open storage-rls-policies.html manually."
fi

echo "Please copy the SQL script from the browser and run it in the Supabase SQL Editor."
