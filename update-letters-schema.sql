-- Add letters table to store saved letters
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  client_name TEXT,
  visa_type TEXT NOT NULL,
  letter_type TEXT NOT NULL, -- 'petition' or 'expert'
  beneficiary_name TEXT,
  petitioner_name TEXT,
  document_ids TEXT[] DEFAULT '{}', -- Array of document IDs used in this letter
  tags TEXT[] DEFAULT '{}'
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create policies for letters table
CREATE POLICY "Allow authenticated users to select letters" 
  ON public.letters FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert letters" 
  ON public.letters FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update letters" 
  ON public.letters FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete letters" 
  ON public.letters FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.letters
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
