-- Enable anonymous sign-ins in Supabase Auth
UPDATE auth.config
SET enable_signup = true;

-- Make sure anonymous sign-ins are allowed
INSERT INTO auth.flow_state (id, auth_code, code_challenge_method, code_challenge, provider, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method)
VALUES
    (gen_random_uuid(), gen_random_uuid()::text, 'S256', gen_random_uuid()::text, 'anonymous', 'anonymous', null, null, now(), now(), 'anonymous')
ON CONFLICT DO NOTHING;

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
