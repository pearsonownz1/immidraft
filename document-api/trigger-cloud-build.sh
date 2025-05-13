#!/bin/bash

# This script triggers a build using Google Cloud Build with the cloudbuild.yaml configuration

set -e

# === CONFIGURATION ===
PROJECT_ID="original-nation-459118-a4"
REGION="us-central1"

echo "==============================================================="
echo "🚀 Triggering build on Google Cloud Build"
echo "==============================================================="

# Set the project
gcloud config set project "$PROJECT_ID"

# Submit the build
echo "📤 Submitting build to Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml --region="$REGION" .

echo "✅ Build submitted! Check the Cloud Build console for progress."
echo "   https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
