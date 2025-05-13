#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${1:-"original-nation-459118-a4"}  # Default project ID, can be overridden by first argument
REGION=${2:-"us-central1"}                    # Default region, can be overridden by second argument
REPOSITORY_NAME="cloud-run-source-deploy"     # Repository name used by Cloud Run

echo "Setting up Artifact Registry for Cloud Run Deployments"
echo "======================================================"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Repository Name: $REPOSITORY_NAME"
echo "======================================================"

# Ensure gcloud is configured with the correct project
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Get the current user email
USER_EMAIL=$(gcloud config get-value account)
echo "Current user: $USER_EMAIL"

# Enable Artifact Registry API if not already enabled
echo "Enabling Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com

# Check if the repository exists
echo "Checking if repository exists..."
if gcloud artifacts repositories describe $REPOSITORY_NAME --location=$REGION &>/dev/null; then
  echo "Repository $REPOSITORY_NAME already exists in $REGION"
else
  echo "Creating repository $REPOSITORY_NAME in $REGION..."
  gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Repository for Cloud Run deployments"
fi

# Grant the current user Artifact Registry Writer role
echo "Granting Artifact Registry Writer role to current user..."
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
  --location=$REGION \
  --member="user:$USER_EMAIL" \
  --role="roles/artifactregistry.writer"

# Grant the current user Artifact Registry Admin role (for full control)
echo "Granting Artifact Registry Admin role to current user..."
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
  --location=$REGION \
  --member="user:$USER_EMAIL" \
  --role="roles/artifactregistry.admin"

# Grant the Cloud Build service account Artifact Registry Writer role
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"
echo "Granting Artifact Registry Writer role to Cloud Build service account..."
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
  --location=$REGION \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Grant the Compute service account Artifact Registry Reader role
echo "Granting Artifact Registry Reader role to Compute service account..."
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
  --location=$REGION \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.reader"

echo "======================================================"
echo "Artifact Registry setup complete!"
echo "You should now be able to deploy to Cloud Run."
echo "To deploy, run: ./deploy-with-logs.sh"
echo "======================================================"
