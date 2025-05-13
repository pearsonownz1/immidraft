-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_first_name TEXT NOT NULL,
  client_last_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  visa_type TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  beneficiary_name TEXT NOT NULL,
  petitioner_name TEXT NOT NULL,
  job_title TEXT,
  job_description TEXT
);
