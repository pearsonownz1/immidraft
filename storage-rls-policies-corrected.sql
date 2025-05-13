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

-- Verify the policies were created
SELECT 
  policyname, 
  permissive,
  roles,
  cmd,
  tablename
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY cmd;
