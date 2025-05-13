#!/bin/bash

# Script to open the direct test HTML file in the default browser

echo "Opening direct-test.html in your default browser..."

# Check if the file exists
if [ ! -f "public/direct-test.html" ]; then
  echo "Error: public/direct-test.html not found!"
  exit 1
fi

# Open the file in the default browser based on the OS
case "$(uname -s)" in
  Darwin)  # macOS
    open "public/direct-test.html"
    ;;
  Linux)   # Linux
    if command -v xdg-open > /dev/null; then
      xdg-open "public/direct-test.html"
    else
      echo "Error: xdg-open not found. Please install it or open the file manually."
      exit 1
    fi
    ;;
  CYGWIN*|MINGW*|MSYS*)  # Windows
    start "public/direct-test.html"
    ;;
  *)
    echo "Error: Unsupported operating system. Please open the file manually."
    echo "File path: $(pwd)/public/direct-test.html"
    exit 1
    ;;
esac

echo "Done!"
