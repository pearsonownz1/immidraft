// This script tests the CaseWorkspace component's ability to fetch case data
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

console.log('Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCaseWorkspace() {
  try {
    // Get a sample case ID from the database
    console.log('Fetching a sample case ID...');
    const { data: cases, error: queryError } = await supabase
      .from('cases')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('Error fetching cases:', queryError);
      return;
    }
    
    if (!cases || cases.length === 0) {
      console.error('No cases found in the database');
      return;
    }
    
    const testCaseId = cases[0].id;
    console.log(`Found case ID: ${testCaseId}`);
    
    // Simulate the CaseWorkspace component's fetch operation
    console.log(`\nSimulating CaseWorkspace fetch for case ID: ${testCaseId}`);
    
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', testCaseId)
      .single();
    
    if (caseError) {
      console.error('Error fetching case:', caseError);
      console.log('\nDEBUG INFO:');
      console.log('Error object:', JSON.stringify(caseError, null, 2));
      console.log('Request parameters:', { id: testCaseId });
      return;
    }
    
    console.log('Successfully fetched case data:');
    console.log(JSON.stringify(caseData, null, 2));
    
    // Test with an invalid case ID to see error handling
    const invalidCaseId = '00000000-0000-0000-0000-000000000000';
    console.log(`\nTesting with invalid case ID: ${invalidCaseId}`);
    
    const { data: invalidData, error: invalidError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', invalidCaseId)
      .single();
    
    if (invalidError) {
      console.log('Expected error received for invalid case ID:', invalidError.message);
    } else {
      console.log('Unexpected success with invalid case ID:', invalidData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testCaseWorkspace()
  .then(() => console.log('\nTest completed'))
  .catch(err => console.error('Test failed:', err));
