    #!/bin/bash
# Script to set up Google Cloud Workload Identity Federation for Vercel

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${GREEN}$1${NC}"
}

print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

print_error() {
  echo -e "${RED}$1${NC}"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  print_error "gcloud CLI is not installed. Please install it first."
  exit 1
fi

# Check if logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  print_error "You are not logged in to gcloud. Please run 'gcloud auth login' first."
  exit 1
fi

# Project ID
PROJECT_ID="original-nation-459118-a4"
print_message "Using Google Cloud Project ID: $PROJECT_ID"

# Workload Identity Pool and Provider names
POOL_ID="vercel-pool"
PROVIDER_ID="vercel-provider"
SERVICE_ACCOUNT_ID="document-ai-service-account"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_ID@$PROJECT_ID.iam.gserviceaccount.com"

# Step 1: Create Workload Identity Pool
print_message "Step 1: Creating Workload Identity Pool '$POOL_ID'..."
if gcloud iam workload-identity-pools describe "$POOL_ID" --project="$PROJECT_ID" --location="global" &> /dev/null; then
  print_warning "Workload Identity Pool '$POOL_ID' already exists. Skipping creation."
else
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --project="$PROJECT_ID" \
    --location="global" \
    --display-name="Vercel Deployments Pool"
  print_message "Workload Identity Pool created successfully."
fi

# Step 2: Create OIDC Provider for Vercel
print_message "Step 2: Creating OIDC Provider '$PROVIDER_ID' for Vercel..."
if gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$POOL_ID" &> /dev/null; then
  print_warning "Provider '$PROVIDER_ID' already exists. Skipping creation."
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$POOL_ID" \
    --display-name="Vercel Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud,attribute.vercel_project=assertion.vercel.projectId" \
    --issuer-uri="https://vercel.com"
  print_message "OIDC Provider created successfully."
fi

# Step 3: Create Service Account (if it doesn't exist)
print_message "Step 3: Creating Service Account '$SERVICE_ACCOUNT_ID'..."
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID" &> /dev/null; then
  print_warning "Service Account '$SERVICE_ACCOUNT_EMAIL' already exists. Skipping creation."
else
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_ID" \
    --project="$PROJECT_ID" \
    --display-name="Document AI Service Account"
  print_message "Service Account created successfully."
fi

# Step 4: Grant the Service Account access to Document AI
print_message "Step 4: Granting Document AI access to Service Account..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/documentai.apiUser"
print_message "Document AI access granted successfully."

# Step 5: Allow the Workload Identity Pool to impersonate the Service Account
print_message "Step 5: Allowing Workload Identity Pool to impersonate Service Account..."
VERCEL_PROJECT_NAME="immidraft"
PROJECT_NUMBER="602726513834"
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/attribute.vercel_project/$VERCEL_PROJECT_NAME"
print_message "Workload Identity Pool impersonation configured successfully."

# Step 6: Generate a Credential Configuration File
print_message "Step 6: Generating credential configuration file..."
POOL_PROVIDER="projects/$PROJECT_ID/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"
gcloud iam workload-identity-pools create-cred-config \
  "$POOL_PROVIDER" \
  --service-account="$SERVICE_ACCOUNT_EMAIL" \
  --output-file="./wif-credentials.json" \
  --credential-source-type="json" \
  --credential-source-field-name="jwt" \
  --credential-source-file="./.vercel/credentials.json"
print_message "Credential configuration file generated: wif-credentials.json"

# Step 7: Base64 encode the credential configuration file
print_message "Step 7: Base64 encoding the credential configuration file..."
ENCODED_CREDENTIALS=$(cat wif-credentials.json | base64)
echo "$ENCODED_CREDENTIALS" > wif-credentials-base64.txt
print_message "Base64 encoded credentials saved to: wif-credentials-base64.txt"

# Step 8: Instructions for Vercel
print_message "Step 8: Next steps for Vercel configuration:"
echo ""
echo "1. Add the following environment variable to your Vercel project:"
echo "   Name: GOOGLE_APPLICATION_CREDENTIALS_JSON"
echo "   Value: (content of wif-credentials-base64.txt)"
echo ""
echo "2. Update your Document AI client initialization code in api/process-document.js:"
echo ""
cat << 'EOF'
// Function to decode and use the credentials
function getCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }
  
  // Decode the base64-encoded credentials
  const decodedCredentials = Buffer.from(credentialsJson, 'base64').toString('utf-8');
  return JSON.parse(decodedCredentials);
}

// Initialize the Document AI client with workload identity federation
const documentAiClient = new DocumentProcessorServiceClient({
  credentials: getCredentials()
});
EOF
echo ""
echo "3. Deploy your updated code to Vercel:"
echo "   ./deploy-to-vercel.sh"
echo ""

print_message "Workload Identity Federation setup complete!"
