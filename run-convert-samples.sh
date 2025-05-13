#!/bin/bash

# Create the samples directory structure if it doesn't exist
mkdir -p public/samples/EB1
mkdir -p public/samples/EB2
mkdir -p public/samples/O1
mkdir -p public/samples/L1
mkdir -p public/samples/H1B

echo "Sample directories created at public/samples/"
echo "Please place your sample letters in the appropriate visa type folders:"
echo "  - public/samples/EB1/ for EB-1 visa samples"
echo "  - public/samples/EB2/ for EB-2 NIW visa samples"
echo "  - public/samples/O1/ for O-1 visa samples"
echo "  - public/samples/L1/ for L-1 visa samples"
echo "  - public/samples/H1B/ for H-1B visa samples"
echo ""
echo "After adding your sample files, press Enter to continue..."
read -p ""

# Run the conversion script
echo "Running sample conversion script..."
node scripts/convert-samples.js

echo ""
echo "Conversion complete! Sample letters have been processed and saved to src/data/sampleLetters.json"
