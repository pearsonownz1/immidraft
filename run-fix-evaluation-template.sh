#!/bin/bash

# Run the template fix script
node scripts/fix-evaluation-template.js

# Check if the script was successful
if [ $? -eq 0 ]; then
  echo "Template fix completed successfully"
else
  echo "Error fixing template"
  exit 1
fi

# Make the script executable
chmod +x run-fix-evaluation-template.sh
