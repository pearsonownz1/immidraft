# Supabase Storage RLS Policy Fix

## Issue

The application was encountering a "row-level security policy violation" error when trying to access or upload files to the "documents" storage bucket in Supabase. This was happening because the necessary Row Level Security (RLS) policies were not properly set up for the storage bucket.

## Solution

We created and executed an SQL script to set up the proper RLS policies for the "documents" bucket. The script:

1. Verified if the "documents" bucket exists and created it if needed
2. Created the following RLS policies on the `storage.objects` table:
   - Public read access for anonymous users
   - Public read access for authenticated users
   - Upload permissions for authenticated users
   - Update permissions for file owners
   - Delete permissions for file owners

## Implementation Details

The SQL script used to fix the issue:

```sql
-- SQL script to set up RLS policies for the existing 'documents' bucket in Supabase

-- First, let's check if the bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Now let's set up the policies

-- 1. Allow public read access (SELECT) for anonymous users
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'documents');

-- 2. Allow public read access (SELECT) for authenticated users
CREATE POLICY "Allow authenticated read access"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- 3. Allow authenticated uploads (INSERT)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- 4. Allow users to update their files (UPDATE)
CREATE POLICY "Allow users to update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (auth.uid() = owner))
WITH CHECK (bucket_id = 'documents' AND (auth.uid() = owner));

-- 5. Allow users to delete their files (DELETE)
CREATE POLICY "Allow users to delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (auth.uid() = owner));
```

## Verification

After running the script, we verified that all the policies were created correctly by checking the results of the following query:

```sql
SELECT 
  policyname, 
  permissive,
  roles,
  cmd,
  tablename
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY cmd;
```

The results showed that all five policies were created successfully with the correct permissions and roles.

## Deployment

After fixing the RLS policies, we redeployed the application to Vercel to test if the fix resolved the issue. The document upload functionality should now work correctly without the "row-level security policy violation" error.

## Future Considerations

If you need to create additional storage buckets in the future, make sure to set up similar RLS policies for those buckets as well. You can use the same SQL script as a template, just replace 'documents' with the name of your new bucket.
