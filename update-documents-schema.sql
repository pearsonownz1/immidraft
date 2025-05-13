-- Add new columns to the documents table for document processing
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS ai_tags TEXT[];

-- Create an index on the extracted_text column for faster full-text search
CREATE INDEX IF NOT EXISTS idx_documents_extracted_text ON documents USING GIN (to_tsvector('english', COALESCE(extracted_text, '')));

-- Create an index on the summary column for faster full-text search
CREATE INDEX IF NOT EXISTS idx_documents_summary ON documents USING GIN (to_tsvector('english', COALESCE(summary, '')));

-- Create an index on the ai_tags column for faster array operations
CREATE INDEX IF NOT EXISTS idx_documents_ai_tags ON documents USING GIN (ai_tags);

-- Add a comment to the documents table to explain the new columns
COMMENT ON TABLE documents IS 'Documents uploaded by users, with extracted text, summaries, and AI-generated tags';
COMMENT ON COLUMN documents.extracted_text IS 'Text extracted from the document using OCR or text extraction';
COMMENT ON COLUMN documents.summary IS 'AI-generated summary of the document content';
COMMENT ON COLUMN documents.ai_tags IS 'AI-generated tags for the document based on its content';
