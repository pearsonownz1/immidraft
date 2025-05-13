#!/bin/bash

# Open the corrected storage RLS policies HTML file in the default browser

echo "Opening Corrected Storage RLS Policies in browser..."

# Determine the OS and use the appropriate command
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open storage-rls-policies-corrected.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open storage-rls-policies-corrected.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start storage-rls-policies-corrected.html
else
  echo "Unsupported OS. Please open storage-rls-policies-corrected.html manually."
fi

echo "Please copy the SQL script from the browser and run it in the Supabase SQL Editor."
