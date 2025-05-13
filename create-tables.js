import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables
async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create cases table
    const { data: casesData, error: casesError } = await supabase.rpc('create_cases_table');
    
    if (casesError) {
      console.error('Error creating cases table:', casesError);
      
      // Try creating the stored procedure first
      console.log('Creating stored procedure for cases table...');
      const { error: procError } = await supabase.rpc('create_stored_procedure', {
        procedure_name: 'create_cases_table',
        procedure_sql: `
          CREATE OR REPLACE FUNCTION create_cases_table()
          RETURNS void AS $$
          BEGIN
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
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (procError) {
        console.error('Error creating stored procedure:', procError);
      } else {
        console.log('Stored procedure created successfully. Trying to create cases table again...');
        const { error: retryError } = await supabase.rpc('create_cases_table');
        if (retryError) {
          console.error('Error creating cases table (retry):', retryError);
        } else {
          console.log('Cases table created successfully!');
        }
      }
    } else {
      console.log('Cases table created successfully!');
    }
    
    // Create other tables using the same approach...
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
