import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read the SQL file
const sqlContent = fs.readFileSync('supabase-schema.sql', 'utf8');

// Split the SQL into individual statements
const statements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Execute each statement
async function executeSQL() {
  console.log(`Executing ${statements.length} SQL statements...`);
  
  try {
    // First, try to create the extension if it doesn't exist
    console.log('Enabling uuid-ossp extension...');
    await supabase.rpc('execute_sql', { 
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"' 
    });
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('execute_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
      }
    }
    
    console.log('SQL execution completed');
  } catch (error) {
    console.error('Error executing SQL:', error);
  }
}

// Execute the SQL
executeSQL();
