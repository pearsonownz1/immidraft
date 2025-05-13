// Test script for document upload with proper UUID format
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentUpload() {
  try {
    console.log('Testing document upload with proper UUID format...');
    
    // Generate a proper UUID
    const documentId = randomUUID();
    console.log(`Generated UUID: ${documentId}`);
    
    // Create a test document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        case_id: 'fe1d85ae-2d75-4505-8695-86fb33a34d62', // Use an existing case ID
        name: 'Test Document',
        size: '10 KB',
        type: 'test',
        url: 'https://example.com/test.pdf',
        extracted_text: 'This is a test document',
        summary: 'Test summary',
        ai_tags: ['test', 'document']
      })
      .select();
    
    if (error) {
      console.error('Error creating document:', error);
      return;
    }
    
    console.log('Document created successfully:', data);
    
    // Update the document to simulate processing
    const { data: updatedData, error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_text: 'Updated extracted text',
        summary: 'Updated summary',
        ai_tags: ['updated', 'test', 'document']
      })
      .eq('id', documentId)
      .select();
    
    if (updateError) {
      console.error('Error updating document:', updateError);
      return;
    }
    
    console.log('Document updated successfully:', updatedData);
    
    // Clean up - delete the test document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return;
    }
    
    console.log('Document deleted successfully');
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDocumentUpload();
