import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { documentProcessingService } from './documentProcessingService';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseInsert = Database['public']['Tables']['cases']['Insert'];
type CaseUpdate = Database['public']['Tables']['cases']['Update'];

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

/**
 * Create a new case in the database
 */
export const createCase = async (caseData: CaseInsert): Promise<Case | null> => {
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single();

  if (error) {
    console.error('Error creating case:', error);
    return null;
  }

  return data;
};

/**
 * Get a case by ID
 */
export const getCaseById = async (id: string): Promise<Case | null> => {
  console.log(`Fetching case with ID: ${id}`);
  
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      return null;
    }

    console.log(`Successfully fetched case:`, data);
    return data;
  } catch (err) {
    console.error('Exception in getCaseById:', err);
    return null;
  }
};

/**
 * Get all cases
 */
export const getAllCases = async (): Promise<Case[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }

  return data || [];
};

/**
 * Update a case
 */
export const updateCase = async (id: string, updates: CaseUpdate): Promise<Case | null> => {
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case:', error);
    return null;
  }

  return data;
};

/**
 * Delete a case
 */
export const deleteCase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting case:', error);
    return false;
  }

  return true;
};

/**
 * Add a document to a case
 */
export const addDocumentToCase = async (
  caseId: string,
  documentData: Omit<DocumentInsert, 'case_id'>
): Promise<Document | null> => {
  try {
    // Insert the document into the database
    const { data, error } = await supabase
      .from('documents')
      .insert({ ...documentData, case_id: caseId })
      .select()
      .single();

    if (error) {
      console.error('Error adding document to case:', error);
      return null;
    }

    // Process the document to extract text and generate summary
    if (data) {
      console.log('Document added successfully, processing document...');
      
      try {
        // Process the document and wait for the result
        const processedDoc = await documentProcessingService.processDocument(
          data.id,
          documentData.url || '',
          documentData.type || '',
          documentData.name || ''
        );
        
        if (processedDoc) {
          console.log('Document processed successfully:', processedDoc.id);
          
          // Update the document in the database with the processed data
          const { data: updatedDoc, error: updateError } = await supabase
            .from('documents')
            .update({
              extracted_text: processedDoc.extracted_text,
              summary: processedDoc.summary,
              ai_tags: processedDoc.ai_tags
            })
            .eq('id', data.id)
            .select()
            .single();
            
          if (updateError) {
            console.error('Error updating document with processed data:', updateError);
            return processedDoc; // Return processed doc even if update fails
          }
          
          console.log('Document updated in database with AI-generated fields');
          return updatedDoc;
        } else {
          console.error('Failed to process document:', data.id);
        }
      } catch (err) {
        console.error('Error processing document:', err);
      }
    }

    return data;
  } catch (err) {
    console.error('Exception in addDocumentToCase:', err);
    return null;
  }
};

/**
 * Get all documents for a case
 */
export const getCaseDocuments = async (caseId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching case documents:', error);
    return [];
  }

  return data || [];
};
