import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create a test case
async function createTestCase() {
  try {
    console.log('Creating a test case...');
    
    const caseData = {
      client_first_name: 'Test',
      client_last_name: 'User',
      visa_type: 'o1a',
      beneficiary_name: 'Test Beneficiary',
      petitioner_name: 'Test Petitioner'
    };
    
    const { data, error } = await supabase
      .from('cases')
      .insert(caseData)
      .select();
    
    if (error) {
      console.error('Error creating test case:', error);
    } else {
      console.log('Test case created successfully:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
createTestCase();
