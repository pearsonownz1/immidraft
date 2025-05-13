import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read the SQL file
const sql = fs.readFileSync('supabase-schema.sql', 'utf8');

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Split the SQL into individual statements
const statements = sql.split(';').filter(statement => statement.trim() !== '');

// Execute each statement
async function executeStatements() {
  try {
    for (const statement of statements) {
      console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
      
      if (error) {
        console.error('Error executing statement:', error);
      } else {
        console.log('Statement executed successfully');
      }
    }
    console.log('All statements executed');
  } catch (error) {
    console.error('Error:', error);
  }
}

executeStatements();
