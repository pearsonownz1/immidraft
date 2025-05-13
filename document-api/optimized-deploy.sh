#!/bin/bash

set -e

# === CONFIGURATION ===
PROJECT_ID="original-nation-459118-a4"
REGION="us-central1"
REPO="cloud-run-source-deploy"
SERVICE_NAME="document-ai-api"
PROCESSOR_ID="9e624c7085434bd9"
PROJECT_NUMBER="602726513834"
USER_EMAIL="support@crediteval.com"

# Check if WIF credentials file exists
WIF_CREDENTIALS_FILE="../wif-credentials.json"
if [ ! -f "$WIF_CREDENTIALS_FILE" ]; then
  echo "❌ Error: WIF credentials file not found at $WIF_CREDENTIALS_FILE"
  echo "Please run the generate-wif-credentials.sh script first"
  exit 1
fi

# Base64 encode the WIF credentials
WIF_CREDENTIALS_BASE64=$(base64 -i "$WIF_CREDENTIALS_FILE" | tr -d '\n')

echo "==============================================================="
echo "🚀 Deploying to Google Cloud Run with WIF Authentication"
echo "==============================================================="

gcloud config set project "$PROJECT_ID"

# === Ensure Artifact Registry Repo Exists ===
echo "🔍 Checking for Artifact Registry repository..."
EXISTS=$(gcloud artifacts repositories list \
  --location="$REGION" \
  --filter="name~$REPO" \
  --format="value(name)")

if [ -z "$EXISTS" ]; then
  echo "📦 Creating Artifact Registry repository..."
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Cloud Run source builds"
else
  echo "✅ Artifact Registry repo exists: $REPO"
fi

# === IAM BINDINGS ===
echo "🔐 Granting roles/artifactregistry.writer to all required identities..."

gcloud artifacts repositories add-iam-policy-binding "$REPO" \
  --location="$REGION" \
  --member="user:$USER_EMAIL" \
  --role="roles/artifactregistry.writer" || true

gcloud artifacts repositories add-iam-policy-binding "$REPO" \
  --location="$REGION" \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" || true

gcloud artifacts repositories add-iam-policy-binding "$REPO" \
  --location="$REGION" \
  --member="serviceAccount:service-$PROJECT_NUMBER@gcp-sa-cloudbuild.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" || true

# === Docker Auth for Artifact Registry ===
echo "🔑 Configuring Docker authentication for Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# === Setup BuildKit ===
echo "🔧 Setting up BuildKit for faster builds..."
# Create .buildx-cache directory if it doesn't exist
mkdir -p .buildx-cache

# Create a new builder if it doesn't exist
if ! docker buildx inspect builder > /dev/null 2>&1; then
  echo "Creating new Docker BuildKit builder..."
  docker buildx create --name builder --use
else
  echo "Using existing Docker BuildKit builder..."
  docker buildx use builder
fi

# === Build and Deploy with BuildKit ===
echo "🏗️ Building with BuildKit and deploying to Cloud Run..."
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE_NAME}"

# Build with BuildKit and cache
docker buildx build \
  --platform=linux/amd64 \
  --cache-from=type=local,src=.buildx-cache \
  --cache-to=type=local,dest=.buildx-cache-new \
  -t "${IMAGE_NAME}" \
  --push \
  .

# Move the new cache to the old cache location
rm -rf .buildx-cache
mv .buildx-cache-new .buildx-cache

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="${IMAGE_NAME}" \
  --region "$REGION" \
  --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID,GCP_LOCATION=us,GCP_PROCESSOR_ID=$PROCESSOR_ID,GOOGLE_APPLICATION_CREDENTIALS_JSON=$WIF_CREDENTIALS_BASE64" \
  --allow-unauthenticated

echo "✅ Deployment complete!"
echo "🔒 Service is now using Workload Identity Federation for authentication"
