#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
USER_EMAIL=${2:-$(gcloud config get-value account)}  # Default to current user, can be overridden by second argument

echo "Granting Logs Viewer access for Google Cloud Project"
echo "===================================================="
echo "Project ID: $PROJECT_ID"
echo "User Email: $USER_EMAIL"
echo "===================================================="

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Grant Logs Viewer role
echo "Granting Logs Viewer role to $USER_EMAIL..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/logging.viewer"

# Grant Logs View Accessor role (for accessing logs in custom buckets)
echo "Granting Logs View Accessor role to $USER_EMAIL..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/logging.viewAccessor"

echo "===================================================="
echo "Permissions granted successfully!"
echo "You should now be able to view logs in the Google Cloud Console"
echo "or using the gcloud command line tool."
echo ""
echo "To view logs for Cloud Run service, use:"
echo "gcloud logging read 'resource.type=cloud_run_revision' --project=$PROJECT_ID"
echo ""
echo "To view logs for Document AI, use:"
echo "gcloud logging read 'resource.type=documentai.googleapis.com/Processor' --project=$PROJECT_ID"
echo "===================================================="
