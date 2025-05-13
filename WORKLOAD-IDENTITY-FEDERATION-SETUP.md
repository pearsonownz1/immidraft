# Setting Up Google Cloud Workload Identity Federation with Vercel

This guide explains how to set up Workload Identity Federation to authenticate your Vercel deployment with Google Cloud services like Document AI, without using service account keys.

## What is Workload Identity Federation?

Workload Identity Federation allows external workloads (like applications running on Vercel) to access Google Cloud resources securely without using service account keys. Instead, it uses OpenID Connect (OIDC) tokens provided by Vercel to authenticate with Google Cloud.

## Prerequisites

- Google Cloud project with Document AI enabled
- Vercel account and project
- `gcloud` CLI installed and configured

## Setup Process

### 1. Run the Setup Script

We've provided a script that automates most of the setup process. Run:

```bash
chmod +x setup-workload-identity-federation.sh
./setup-workload-identity-federation.sh
```

This script will:
- Create a Workload Identity Pool
- Create an OIDC Provider for Vercel
- Create a Service Account (or use an existing one)
- Grant the Service Account access to Document AI
- Allow the Workload Identity Pool to impersonate the Service Account
- Generate a credential configuration file
- Base64 encode the credential configuration file

### 2. Configure Vercel Environment Variables

After running the script, you'll have a file called `wif-credentials-base64.txt` containing the base64-encoded credentials configuration.

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add a new environment variable:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: (paste the content of `wif-credentials-base64.txt`)
4. Save the environment variable

### 3. Update Your API Code

Replace the existing Document AI client initialization in `api/process-document.js` with the code from `api/process-document-with-wif.js`, or simply rename the file to use the new implementation.

The key changes are:

```javascript
// Function to decode and use the credentials
function getCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }
  
  try {
    // Decode the base64-encoded credentials
    const decodedCredentials = Buffer.from(credentialsJson, 'base64').toString('utf-8');
    return JSON.parse(decodedCredentials);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format');
  }
}

// Initialize the Document AI client with workload identity federation
const documentAiClient = new DocumentProcessorServiceClient({
  credentials: getCredentials()
});
```

### 4. Deploy to Vercel

Deploy your updated code to Vercel:

```bash
./deploy-to-vercel.sh
```

## Troubleshooting

### Common Issues

1. **Invalid Credentials Format**
   - Make sure the credentials JSON is properly base64 encoded
   - Check that the environment variable is set correctly in Vercel

2. **Permission Denied**
   - Verify that the service account has the necessary permissions
   - Check that the Workload Identity Pool is properly configured

3. **OIDC Token Issues**
   - Ensure that Vercel is properly configured as an OIDC provider
   - Check the attribute mappings in the Workload Identity Pool configuration

### Debugging

To debug issues, check the Vercel function logs. They will contain detailed error messages that can help identify the problem.

## Security Benefits

Using Workload Identity Federation instead of service account keys provides several security benefits:

1. No long-lived credentials to manage or rotate
2. No risk of key exposure in code or configuration files
3. Fine-grained control over which workloads can access which resources
4. Audit trail of all access through Google Cloud's logging

## Additional Resources

- [Google Cloud Workload Identity Federation Documentation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Cloud Document AI Documentation](https://cloud.google.com/document-ai/docs)
