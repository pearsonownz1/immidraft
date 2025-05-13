# Supabase Storage Bucket Creation Instructions

The application is encountering a "Bucket not found" error because the required storage bucket named `documents` does not exist in your Supabase project.

## Why This Is Happening

The error occurs because:
1. The application tries to upload files to a Supabase storage bucket named `documents`
2. This bucket doesn't exist in your Supabase project
3. The anonymous API key doesn't have permission to create buckets (due to Row Level Security policies)

## How to Fix This

You need to manually create the storage bucket in the Supabase dashboard:

1. Go to your Supabase project dashboard: https://app.supabase.com/project/nhlvmzurgvkiltpzycyt
2. Click on "Storage" in the left sidebar
3. Click the "New Bucket" button
4. Enter `documents` as the bucket name
5. Check the "Public bucket" option to make files publicly accessible
6. Click "Create bucket"

## Setting Up Access Policies

After creating the bucket, you need to set up access policies:

1. Click on the newly created `documents` bucket
2. Go to the "Policies" tab
3. Create the following policies:

### Policy 1: Allow public read access
- Policy name: `Allow public read access`
- Allowed operation: `SELECT`
- Target roles: `anon, authenticated`
- Policy definition: `true`

### Policy 2: Allow authenticated uploads
- Policy name: `Allow authenticated uploads`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `true`

### Policy 3: Allow users to update their files
- Policy name: `Allow users to update their files`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `(auth.uid() = owner)`

### Policy 4: Allow users to delete their files
- Policy name: `Allow users to delete their files`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `(auth.uid() = owner)`

## After Creating the Bucket

Once you've created the bucket and set up the policies, the application should be able to upload files without encountering the "Bucket not found" error.

## Verifying the Fix

1. After creating the bucket, redeploy the application to Vercel
2. Test the document upload functionality to ensure it's working correctly
