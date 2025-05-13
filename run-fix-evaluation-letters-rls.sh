#!/bin/bash

echo "Running script to fix RLS policies for evaluation letters..."
node execute-fix-evaluation-letters-rls.js

echo "Deploying to Vercel after fixing RLS policies..."
vercel --prod
