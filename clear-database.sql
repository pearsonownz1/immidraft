-- Clear all data from the database tables
-- WARNING: This will delete ALL data from the tables

-- Delete all data from document_criteria table
DELETE FROM public.document_criteria;

-- Delete all data from documents table
DELETE FROM public.documents;

-- Delete all data from cases table
DELETE FROM public.cases;

-- Delete all data from criteria table
DELETE FROM public.criteria;

-- Verify that all tables are empty
SELECT 'document_criteria' as table_name, COUNT(*) as row_count FROM public.document_criteria
UNION ALL
SELECT 'documents' as table_name, COUNT(*) as row_count FROM public.documents
UNION ALL
SELECT 'cases' as table_name, COUNT(*) as row_count FROM public.cases
UNION ALL
SELECT 'criteria' as table_name, COUNT(*) as row_count FROM public.criteria;
