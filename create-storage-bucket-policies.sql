-- SQL script to create the "documents" storage bucket and set up access policies
-- Run this in the Supabase SQL Editor (https://app.supabase.com/project/nhlvmzurgvkiltpzycyt/sql)

-- First, create the bucket if it doesn't exist
-- Note: This requires admin privileges and might not work with the SQL editor
-- It's recommended to create the bucket through the UI first, then run the policy part of this script
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Now set up the access policies

-- 1. Allow public read access
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow public read access',
  'true',
  'documents',
  'SELECT',
  'anon'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- Also allow authenticated users to read
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow authenticated read access',
  'true',
  'documents',
  'SELECT',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 2. Allow authenticated uploads
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow authenticated uploads',
  'true',
  'documents',
  'INSERT',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 3. Allow users to update their files
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow users to update their files',
  '(auth.uid() = owner)',
  'documents',
  'UPDATE',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 4. Allow users to delete their files
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow users to delete their files',
  '(auth.uid() = owner)',
  'documents',
  'DELETE',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- Verify the policies were created
SELECT 
  name, 
  definition, 
  bucket_id, 
  operation, 
  role 
FROM storage.policies 
WHERE bucket_id = 'documents'
ORDER BY operation, role;
