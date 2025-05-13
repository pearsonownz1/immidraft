import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Clear all data from the database
async function clearDatabase() {
  try {
    console.log('Clearing all data from the database...');
    
    // Delete all data from document_criteria table
    console.log('Clearing document_criteria table...');
    const { error: docCriteriaError } = await supabase
      .from('document_criteria')
      .delete()
      .is('id', 'id'); // This will match all rows
    
    if (docCriteriaError) {
      console.error('Error clearing document_criteria table:', docCriteriaError);
    } else {
      console.log('document_criteria table cleared successfully!');
    }
    
    // Delete all data from documents table
    console.log('Clearing documents table...');
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .is('id', 'id'); // This will match all rows
    
    if (documentsError) {
      console.error('Error clearing documents table:', documentsError);
    } else {
      console.log('documents table cleared successfully!');
    }
    
    // Delete all data from cases table
    console.log('Clearing cases table...');
    const { error: casesError } = await supabase
      .from('cases')
      .delete()
      .is('id', 'id'); // This will match all rows
    
    if (casesError) {
      console.error('Error clearing cases table:', casesError);
    } else {
      console.log('cases table cleared successfully!');
    }
    
    // Delete all data from criteria table
    console.log('Clearing criteria table...');
    const { error: criteriaError } = await supabase
      .from('criteria')
      .delete()
      .is('id', 'id'); // This will match all rows
    
    if (criteriaError) {
      console.error('Error clearing criteria table:', criteriaError);
    } else {
      console.log('criteria table cleared successfully!');
    }
    
    console.log('All data has been cleared from the database!');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

// Run the function
clearDatabase();
