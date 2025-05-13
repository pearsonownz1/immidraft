import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test the criteria data
async function testCriteriaData() {
  try {
    console.log('Testing criteria data...');
    
    // Get O-1A criteria
    const { data: o1aCriteria, error: o1aError } = await supabase
      .from('criteria')
      .select('*')
      .eq('visa_type', 'o1a');
    
    if (o1aError) {
      console.error('Error fetching O-1A criteria:', o1aError);
    } else {
      console.log(`Found ${o1aCriteria.length} O-1A criteria:`);
      o1aCriteria.forEach(criterion => {
        console.log(`- ${criterion.title} (${criterion.category})`);
      });
    }
    
    // Get EB-1A criteria
    const { data: eb1aCriteria, error: eb1aError } = await supabase
      .from('criteria')
      .select('*')
      .eq('visa_type', 'eb1a');
    
    if (eb1aError) {
      console.error('Error fetching EB-1A criteria:', eb1aError);
    } else {
      console.log(`\nFound ${eb1aCriteria.length} EB-1A criteria:`);
      eb1aCriteria.forEach(criterion => {
        console.log(`- ${criterion.title} (${criterion.category})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing criteria data:', error);
  }
}

// Run the test
testCriteriaData();
