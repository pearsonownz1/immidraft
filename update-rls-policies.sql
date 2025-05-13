-- Update RLS policies to allow anonymous access for development purposes
-- WARNING: This is for development purposes only. In production, you should use proper authentication.

-- Drop existing policies for cases table
DROP POLICY IF EXISTS "Allow authenticated users to select cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated users to insert cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated users to update cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated users to delete cases" ON public.cases;

-- Create new policies for cases table that allow anonymous access
CREATE POLICY "Allow all users to select cases" 
  ON public.cases FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert cases" 
  ON public.cases FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update cases" 
  ON public.cases FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete cases" 
  ON public.cases FOR DELETE 
  USING (true);

-- Drop existing policies for documents table
DROP POLICY IF EXISTS "Allow authenticated users to select documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated users to update documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated users to delete documents" ON public.documents;

-- Create new policies for documents table that allow anonymous access
CREATE POLICY "Allow all users to select documents" 
  ON public.documents FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update documents" 
  ON public.documents FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete documents" 
  ON public.documents FOR DELETE 
  USING (true);

-- Drop existing policies for criteria table
DROP POLICY IF EXISTS "Allow authenticated users to select criteria" ON public.criteria;
DROP POLICY IF EXISTS "Allow authenticated users to insert criteria" ON public.criteria;
DROP POLICY IF EXISTS "Allow authenticated users to update criteria" ON public.criteria;
DROP POLICY IF EXISTS "Allow authenticated users to delete criteria" ON public.criteria;

-- Create new policies for criteria table that allow anonymous access
CREATE POLICY "Allow all users to select criteria" 
  ON public.criteria FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert criteria" 
  ON public.criteria FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update criteria" 
  ON public.criteria FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete criteria" 
  ON public.criteria FOR DELETE 
  USING (true);

-- Drop existing policies for document_criteria table
DROP POLICY IF EXISTS "Allow authenticated users to select document_criteria" ON public.document_criteria;
DROP POLICY IF EXISTS "Allow authenticated users to insert document_criteria" ON public.document_criteria;
DROP POLICY IF EXISTS "Allow authenticated users to update document_criteria" ON public.document_criteria;
DROP POLICY IF EXISTS "Allow authenticated users to delete document_criteria" ON public.document_criteria;

-- Create new policies for document_criteria table that allow anonymous access
CREATE POLICY "Allow all users to select document_criteria" 
  ON public.document_criteria FOR SELECT 
  USING (true);

CREATE POLICY "Allow all users to insert document_criteria" 
  ON public.document_criteria FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all users to update document_criteria" 
  ON public.document_criteria FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all users to delete document_criteria" 
  ON public.document_criteria FOR DELETE 
  USING (true);
