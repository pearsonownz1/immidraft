# Step-by-Step SQL Code for Supabase Database Setup

This document provides step-by-step SQL code to set up the database for the immigration case management application.

## Step 1: Create the cases table

```sql
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
```

## Step 2: Create the documents table

```sql
-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  criteria TEXT[] DEFAULT '{}'
);
```

## Step 3: Create the criteria table

```sql
-- Criteria table
CREATE TABLE IF NOT EXISTS public.criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visa_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  required_count INTEGER DEFAULT 1
);
```

## Step 4: Create the document-criteria junction table

```sql
-- Document-Criteria junction table
CREATE TABLE IF NOT EXISTS public.document_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  UNIQUE(document_id, criterion_id)
);
```

## Step 5: Enable Row Level Security (RLS)

```sql
-- Add RLS (Row Level Security) policies
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_criteria ENABLE ROW LEVEL SECURITY;
```

## Step 6: Create policies for cases table

```sql
-- Create policies for cases table
CREATE POLICY "Allow authenticated users to select cases" 
  ON public.cases FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert cases" 
  ON public.cases FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update cases" 
  ON public.cases FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete cases" 
  ON public.cases FOR DELETE 
  USING (auth.role() = 'authenticated');
```

## Step 7: Create policies for documents table

```sql
-- Create policies for documents table
CREATE POLICY "Allow authenticated users to select documents" 
  ON public.documents FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update documents" 
  ON public.documents FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete documents" 
  ON public.documents FOR DELETE 
  USING (auth.role() = 'authenticated');
```

## Step 8: Create updated_at trigger function

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Step 9: Add triggers for updated_at

```sql
-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
```

## Step 10: Insert sample criteria data for O-1A visa

```sql
-- Insert sample criteria data for O-1A visa
INSERT INTO public.criteria (visa_type, title, description, category, required_count)
VALUES
  ('o1a', 'National or International Award', 'Evidence of receipt of nationally or internationally recognized prizes or awards for excellence in the field of endeavor.', 'Extraordinary Ability Evidence', 3),
  ('o1a', 'Membership in Prestigious Associations', 'Evidence of membership in associations in the field that require outstanding achievements of their members, as judged by recognized experts.', 'Extraordinary Ability Evidence', 2),
  ('o1a', 'Published Material About the Beneficiary', 'Published material about the beneficiary in professional or major trade publications or other major media.', 'Extraordinary Ability Evidence', 3),
  ('o1a', 'Original Contributions of Major Significance', 'Evidence of the beneficiary''s original scientific, scholarly, artistic, athletic, or business-related contributions of major significance in the field.', 'Professional Background', 4),
  ('o1a', 'Scholarly Articles', 'Evidence of the beneficiary''s authorship of scholarly articles in the field, in professional or major trade publications or other major media.', 'Professional Background', 2),
  ('o1a', 'High Salary or Remuneration', 'Evidence that the beneficiary has commanded a high salary or other significantly high remuneration for services, in relation to others in the field.', 'Salary and Commercial Success', 2),
  ('o1a', 'Commercial Success in Performing Arts', 'Evidence of commercial successes in the performing arts, as shown by box office receipts or record, cassette, compact disk, or video sales.', 'Salary and Commercial Success', 3);
```

## Step 11: Insert sample criteria for EB-1A visa

```sql
-- Insert sample criteria for EB-1A visa
INSERT INTO public.criteria (visa_type, title, description, category, required_count)
VALUES
  ('eb1a', 'Major International Award', 'Receipt of a major, internationally recognized award, such as the Nobel Prize.', 'Extraordinary Ability Evidence', 1),
  ('eb1a', 'Membership in Elite Organizations', 'Membership in organizations that require outstanding achievements of their members, as judged by recognized national or international experts.', 'Professional Associations', 2),
  ('eb1a', 'Published Material About You', 'Published material in professional publications written by others about your work in the field.', 'Media Recognition', 3),
  ('eb1a', 'Judging the Work of Others', 'Evidence that you have been asked to judge the work of others in your field.', 'Professional Activities', 2),
  ('eb1a', 'Original Scientific Contributions', 'Evidence of your original scientific, scholarly, or business-related contributions of major significance.', 'Contributions to Field', 3),
  ('eb1a', 'Scholarly Articles', 'Evidence of your authorship of scholarly articles in your field, in professional journals or other major media.', 'Publications', 3),
  ('eb1a', 'Artistic Exhibitions', 'Evidence of the display of your work at artistic exhibitions or showcases.', 'Artistic Recognition', 2),
  ('eb1a', 'Leading Role in Distinguished Organizations', 'Evidence that you have performed in a leading or critical role for organizations with distinguished reputations.', 'Leadership', 2),
  ('eb1a', 'High Salary', 'Evidence that you command a high salary or other high remuneration in relation to others in the field.', 'Compensation', 2),
  ('eb1a', 'Commercial Success in Performing Arts', 'Evidence of commercial success in the performing arts.', 'Commercial Success', 2);
```

## Instructions for Use

1. Log in to your Supabase dashboard at https://app.supabase.com/project/nhlvmzurgvkiltpzycyt/sql
2. Navigate to the SQL Editor
3. Copy and paste each SQL block one at a time
4. Execute each step in order
5. Verify that each step completes successfully before moving to the next one

## Troubleshooting

- If you encounter errors about the uuid_generate_v4() function, run this first:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

- If you encounter permission errors, make sure you're logged in with the correct account that has admin privileges for the project.

- If a table already exists and you want to recreate it, you can drop it first:
  ```sql
  DROP TABLE IF EXISTS public.table_name CASCADE;
  ```
  Note: Be careful with this command as it will delete all data in the table.
