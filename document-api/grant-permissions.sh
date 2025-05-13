#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument

echo "Granting necessary permissions for Cloud Run deployment"
echo "======================================================"
echo "Project ID: $PROJECT_ID"
echo "======================================================"

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Get the project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"

# Grant Cloud Build service account the necessary permissions
echo "Granting Cloud Build service account necessary permissions..."

# Cloud Build service account
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant Cloud Build service account the Cloud Run Admin role
echo "Granting Cloud Run Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

# Grant Cloud Build service account the IAM Service Account User role
echo "Granting IAM Service Account User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

# Grant Cloud Build service account the Document AI API User role
echo "Granting Document AI API User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/documentai.apiUser"

# Grant Cloud Build service account the Storage Admin role
echo "Granting Storage Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/storage.admin"

# Grant Cloud Build service account the Artifact Registry Admin role
echo "Granting Artifact Registry Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/artifactregistry.admin"

# Grant Compute Engine default service account the Storage Object Viewer role
echo "Granting Storage Object Viewer role to Compute Engine service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Grant Compute Engine default service account the Logs Writer role
echo "Granting Logs Writer role to Compute Engine service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/logging.logWriter"

echo "======================================================"
echo "Permissions granted successfully!"
echo "You can now try deploying again with:"
echo "./deploy.sh $PROJECT_ID us-central1 9e624c7085434bd9"
echo "======================================================"
