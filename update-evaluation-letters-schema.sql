-- Create evaluation_letters table
CREATE TABLE IF NOT EXISTS evaluation_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID,
  client_name TEXT NOT NULL,
  university TEXT NOT NULL,
  country TEXT,
  bachelor_degree TEXT,
  degree_date1 TEXT,
  us_equivalent_degree1 TEXT,
  additional_degree BOOLEAN DEFAULT FALSE,
  university2 TEXT,
  degree_date2 TEXT,
  us_equivalent_degree2 TEXT,
  university_location TEXT,
  field_of_study TEXT,
  program_length1 TEXT,
  university2_location TEXT,
  field_of_study2 TEXT,
  program_length2 TEXT,
  years TEXT,
  specialty TEXT,
  work_experience_summary JSONB,
  accreditation_body TEXT,
  degree_level TEXT,
  original_documents JSONB,
  extracted_text JSONB,
  ai_summary JSONB,
  final_letter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE evaluation_letters ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own evaluation letters
CREATE POLICY "Users can view their own evaluation letters"
  ON evaluation_letters
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own evaluation letters
CREATE POLICY "Users can insert their own evaluation letters"
  ON evaluation_letters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own evaluation letters
CREATE POLICY "Users can update their own evaluation letters"
  ON evaluation_letters
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own evaluation letters
CREATE POLICY "Users can delete their own evaluation letters"
  ON evaluation_letters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_evaluation_letters_updated_at
BEFORE UPDATE ON evaluation_letters
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create evaluation_letter_documents table for tracking uploaded documents
CREATE TABLE IF NOT EXISTS evaluation_letter_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_letter_id UUID REFERENCES evaluation_letters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  document_type TEXT, -- e.g., 'resume', 'degree', 'transcript'
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for evaluation_letter_documents
ALTER TABLE evaluation_letter_documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own evaluation letter documents
CREATE POLICY "Users can view their own evaluation letter documents"
  ON evaluation_letter_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own evaluation letter documents
CREATE POLICY "Users can insert their own evaluation letter documents"
  ON evaluation_letter_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own evaluation letter documents
CREATE POLICY "Users can update their own evaluation letter documents"
  ON evaluation_letter_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own evaluation letter documents
CREATE POLICY "Users can delete their own evaluation letter documents"
  ON evaluation_letter_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for evaluation_letter_documents
CREATE TRIGGER update_evaluation_letter_documents_updated_at
BEFORE UPDATE ON evaluation_letter_documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
