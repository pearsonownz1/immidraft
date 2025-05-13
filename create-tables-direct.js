import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables directly using the REST API
async function createTables() {
  try {
    console.log('Creating tables directly...');
    
    // Create cases table
    console.log('Creating cases table...');
    const { data: casesData, error: casesError } = await supabase
      .from('cases')
      .insert([
        {
          client_first_name: 'Test',
          client_last_name: 'User',
          visa_type: 'o1a',
          beneficiary_name: 'Test User',
          petitioner_name: 'Test Company'
        }
      ]);
    
    if (casesError) {
      if (casesError.code === '42P01') { // Table doesn't exist
        console.log('Cases table does not exist. Creating it...');
        // We can't create tables directly with the REST API, so we'll need to use the SQL Editor
        console.log('Please create the tables using the SQL Editor in the Supabase dashboard.');
        console.log('Go to https://app.supabase.com/project/nhlvmzurgvkiltpzycyt/sql');
        console.log('Copy and paste the contents of supabase-schema.sql into the SQL Editor and run it.');
      } else {
        console.error('Error creating cases table:', casesError);
      }
    } else {
      console.log('Cases table exists and test record inserted successfully!');
    }
    
    // Test if criteria table exists
    console.log('Testing criteria table...');
    const { data: criteriaData, error: criteriaError } = await supabase
      .from('criteria')
      .select('*')
      .limit(1);
    
    if (criteriaError) {
      if (criteriaError.code === '42P01') { // Table doesn't exist
        console.log('Criteria table does not exist.');
      } else {
        console.error('Error testing criteria table:', criteriaError);
      }
    } else {
      console.log('Criteria table exists!');
    }
    
    // Test if documents table exists
    console.log('Testing documents table...');
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
    
    if (documentsError) {
      if (documentsError.code === '42P01') { // Table doesn't exist
        console.log('Documents table does not exist.');
      } else {
        console.error('Error testing documents table:', documentsError);
      }
    } else {
      console.log('Documents table exists!');
    }
    
    // Test if document_criteria table exists
    console.log('Testing document_criteria table...');
    const { data: docCriteriaData, error: docCriteriaError } = await supabase
      .from('document_criteria')
      .select('*')
      .limit(1);
    
    if (docCriteriaError) {
      if (docCriteriaError.code === '42P01') { // Table doesn't exist
        console.log('Document_criteria table does not exist.');
      } else {
        console.error('Error testing document_criteria table:', docCriteriaError);
      }
    } else {
      console.log('Document_criteria table exists!');
    }
    
    console.log('Table creation/testing completed');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Create the tables
createTables();
