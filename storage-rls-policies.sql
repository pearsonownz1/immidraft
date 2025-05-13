-- SQL script to set up RLS policies for the existing 'documents' bucket in Supabase

-- 1. Allow public read access (SELECT) for anonymous users
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow public read access',
  'true',
  'documents',
  'SELECT',
  'anon'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 2. Allow public read access (SELECT) for authenticated users
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow authenticated read access',
  'true',
  'documents',
  'SELECT',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 3. Allow authenticated uploads (INSERT)
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow authenticated uploads',
  'true',
  'documents',
  'INSERT',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 4. Allow users to update their files (UPDATE)
INSERT INTO storage.policies (name, definition, bucket_id, operation, role)
VALUES (
  'Allow users to update their files',
  '(auth.uid() = owner)',
  'documents',
  'UPDATE',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO NOTHING;

-- 5. Allow users to delete their files (DELETE)
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
