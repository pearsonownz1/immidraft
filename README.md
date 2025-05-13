# GEO Credentials - Immigration Case Management

A modern web application for managing immigration cases, built with React, TypeScript, Vite, and Supabase.

## Features

- Case Builder with step-by-step workflow
- Document management and organization with AI-powered processing
- Criteria tracking for visa applications
- Responsive design with improved spacing and layout
- Supabase database integration for case storage
- AI-powered document processing for text extraction, summarization, and tagging

## Supabase Integration

This project uses Supabase as its backend database. For detailed setup instructions, see [SUPABASE-SETUP.md](SUPABASE-SETUP.md).

Key features of the Supabase integration:
- Store and retrieve case information
- Track documents and their relationship to visa criteria
- Manage visa criteria for different visa types
- Row-level security for data protection
- Storage bucket for document uploads

To set up Supabase:
1. Create a Supabase project
2. Run the SQL script in `supabase-schema.sql`
3. Configure environment variables
4. Set up the storage bucket for document uploads:
   ```bash
   ./setup-supabase-storage.sh
   ```

## Deployment to Vercel

This project is configured for easy deployment to Vercel. Follow these steps to deploy:

1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel** (if using CLI):
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:

   **Option 1: Using the deployment script**
   ```bash
   ./deploy-to-vercel.sh
   ```

   **Option 2: Using Vercel CLI manually**
   ```bash
   vercel
   ```

   **Option 3: Using Vercel Dashboard**
   - Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect the project settings
   - Click "Deploy"

4. **Environment Variables**:
   - Copy `.env.example` to `.env` for local development
   - Add the required environment variables in the Vercel dashboard under Project Settings > Environment Variables
   - See `.env.example` for a list of required environment variables
   - Make sure to add your Supabase URL and anon key to the environment variables

The project includes:
- A `vercel.json` configuration file that handles build settings, output directory configuration, and routing for SPA
- A GitHub Actions workflow for continuous deployment to Vercel
- A deployment script for manual deployments

### GitHub Actions Setup

To use the GitHub Actions workflow for continuous deployment:

1. Run the helper script to get your Vercel configuration:
   ```bash
   ./get-vercel-config.sh
   ```
   This script will guide you through retrieving your Vercel token, organization ID, and project ID.

2. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

3. Push changes to the main branch to trigger automatic deployments

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` to add your Supabase URL and anon key.

3. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test build process**:
   ```bash
   ./test-build.sh
   ```
   This script will build the project and allow you to preview the production build locally.

4. **Build for production**:
   ```bash
   npm run build
   ```

## Document Processing

The application includes an AI-powered document processing pipeline that:
- Extracts text from uploaded documents
- Generates AI-powered summaries and tags
- Uses this information to create more contextually relevant expert letters

For detailed information about the document processing functionality, see [DOCUMENT-PROCESSING.md](DOCUMENT-PROCESSING.md).

### Google Cloud Document AI Integration

The application now supports Google Cloud Document AI for enhanced document processing capabilities:
- More accurate text extraction from various document types
- Support for complex document formats and layouts
- Improved handling of scanned documents and images containing text

To set up the Document AI integration:

1. Install the required dependencies:
   ```bash
   npm run setup:document-ai
   ```

2. Get a Google Cloud access token:
   ```bash
   gcloud auth login
   gcloud auth print-access-token
   ```

3. Update the `.env.document-ai` file with your access token and OpenAI API key

For detailed information about the Document AI integration, see:
- [DOCUMENT-AI-INTEGRATION-README.md](DOCUMENT-AI-INTEGRATION-README.md) - Overview of the integration
- [DOCUMENT-AI-INTEGRATION-GUIDE.md](DOCUMENT-AI-INTEGRATION-GUIDE.md) - Detailed implementation guide

To test the document processing functionality:
1. Read the testing guide: [HOW-TO-TEST-DOCUMENT-PROCESSING.md](HOW-TO-TEST-DOCUMENT-PROCESSING.md)
2. Run the test script:
   ```bash
   ./open-document-processing-test.sh
   ```

### Mock Document AI for Testing

The application includes a mock implementation of the Document AI integration for testing and development purposes:

1. Test the mock Document AI service:
   ```bash
   npm run test:document-ai-mock
   ```

2. Test the UI integration:
   ```bash
   npm run dev
   ```
   Then navigate to: http://localhost:5185/test-document-ai

The mock implementation provides:
- Text extraction simulation
- AI-powered summary and tag generation
- Document processing without requiring Google Cloud or OpenAI API keys

## Helper Scripts

The project includes several helper scripts to streamline the development and deployment process:

### Deployment Scripts
1. **`deploy-to-vercel.sh`**: Builds and deploys the project to Vercel
2. **`get-vercel-config.sh`**: Retrieves Vercel configuration for GitHub Actions setup
3. **`test-build.sh`**: Tests the build process locally before deployment

### Supabase Scripts
1. **`setup-supabase-storage.sh`**: Sets up the Supabase storage bucket for document uploads
2. **`create-storage-bucket.js`**: Creates the "documents" storage bucket in Supabase
3. **`setup-storage-rls.js`**: Sets up Row Level Security policies for the storage bucket
4. **`create-tables.js`**: Creates the database tables in Supabase
5. **`update-rls-policies.js`**: Updates the Row Level Security policies for the database tables

### Testing Scripts
1. **`open-document-processing-test.sh`**: Opens the application for testing document processing
2. **`run-document-processing-test.sh`**: Runs the document processing test
3. **`run-document-ai-test.sh`**: Tests the Google Cloud Document AI integration
4. **`run-document-ai-mock-test.sh`**: Tests the mock Document AI implementation
