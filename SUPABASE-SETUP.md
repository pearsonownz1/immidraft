# Supabase Integration Setup

This document provides instructions for setting up the Supabase integration for the immigration case management application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A new or existing Supabase project
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Log in to your Supabase account
2. Create a new project or use an existing one
3. Note your project URL and anon key from the project settings

### 2. Set Up Environment Variables

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase project details:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_PROJECT_ID=your-project-id
   ```

### 3. Create Database Tables

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of the `supabase-schema.sql` file
3. Paste the SQL into the editor and run it to create all necessary tables and seed data

The SQL script will:
- Create tables for cases, documents, criteria, and document-criteria relationships
- Set up Row Level Security (RLS) policies
- Create triggers for updating timestamps
- Insert sample criteria data for O-1A and EB-1A visa types

### 4. Generate TypeScript Types (Optional)

If you make changes to the database schema, you can regenerate the TypeScript types:

```bash
npm run types:supabase
```

This will update the `src/types/supabase.ts` file with the latest database schema.

## Database Schema

The application uses the following tables:

### Cases
Stores information about immigration cases:
- Client information
- Visa type
- Petition details
- Status

### Documents
Stores documents uploaded for each case:
- Document metadata
- File URL
- Tags and criteria

### Criteria
Stores visa criteria for different visa types:
- Criteria title and description
- Category
- Required document count

### Document Criteria
Junction table linking documents to specific criteria.

## Using the Supabase Client

The application includes a Supabase client configured in `src/lib/supabase.ts`. This client is used by the service functions in `src/services/caseService.ts` to interact with the database.

Example usage:

```typescript
import { createCase } from '@/services/caseService';

// Create a new case
const caseData = {
  client_first_name: 'John',
  client_last_name: 'Doe',
  client_email: 'john@example.com',
  client_phone: '123-456-7890',
  client_company: 'Acme Inc',
  visa_type: 'o1a',
  beneficiary_name: 'John Doe',
  petitioner_name: 'Acme Inc',
  job_title: 'Senior Engineer',
  job_description: 'Leading engineering projects'
};

const savedCase = await createCase(caseData);
```

## Troubleshooting

- **Authentication Issues**: Ensure your Supabase URL and anon key are correct in the `.env` file
- **Database Errors**: Check the browser console for detailed error messages
- **Type Errors**: Make sure to regenerate types after schema changes

## Setting Up Storage for Document Uploads

The application requires a Supabase storage bucket for document uploads. Follow these steps to set up the storage:

1. Make sure your `.env` file is properly configured with your Supabase URL and anon key.

2. Run the storage setup script:
   ```bash
   ./setup-supabase-storage.sh
   ```

   This script will:
   - Create a "documents" storage bucket in your Supabase project
   - Set up appropriate Row Level Security (RLS) policies for the bucket
   - Configure public access for reading files
   - Configure authenticated access for uploading, updating, and deleting files

3. If you encounter any issues, you can run the individual scripts manually:
   ```bash
   node create-storage-bucket.js
   node setup-storage-rls.js
   ```

4. After setting up the storage bucket, restart your development server to ensure the changes take effect.

## Next Steps

- Add user authentication
- Create more detailed reporting and analytics
