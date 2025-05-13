#!/bin/bash

# Script to generate the DOCX evaluation letter template from the text template

echo "Generating DOCX evaluation letter template..."

# Run the Node.js script
node scripts/generate-evaluation-template.js

echo ""
echo "If successful, the DOCX template should now be available at:"
echo "public/templates/Evaluation_Letter_Template_With_Placeholders.docx"
echo ""
echo "This template will be used by the EvalLetterAI feature for generating evaluation letters."
