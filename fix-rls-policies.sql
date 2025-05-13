-- Enable RLS on evaluation_letters table
ALTER TABLE evaluation_letters ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access to evaluation_letters
CREATE POLICY "Allow anonymous access to evaluation_letters"
ON evaluation_letters
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Enable RLS on evaluation_letter_documents table
ALTER TABLE evaluation_letter_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access to evaluation_letter_documents
CREATE POLICY "Allow anonymous access to evaluation_letter_documents"
ON evaluation_letter_documents
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
