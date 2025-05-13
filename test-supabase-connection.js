// This script tests the Supabase connection and logs the results
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Testing connection to Supabase...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test authentication
    console.log('Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError);
    } else {
      console.log('Authentication successful');
    }

    // Test database query
    console.log('\nTesting database query...');
    const { data: cases, error: queryError } = await supabase
      .from('cases')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('Query successful');
      console.log('Sample data:', cases);
    }

    // Test specific case query
    if (cases && cases.length > 0) {
      const testCaseId = cases[0].id;
      console.log(`\nTesting specific case query for ID: ${testCaseId}`);
      
      const { data: singleCase, error: singleCaseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', testCaseId)
        .single();
      
      if (singleCaseError) {
        console.error('Single case query error:', singleCaseError);
      } else {
        console.log('Single case query successful');
        console.log('Case data:', singleCase);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection()
  .then(() => console.log('\nTest completed'))
  .catch(err => console.error('Test failed:', err));
