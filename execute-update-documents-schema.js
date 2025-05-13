// Script to execute the SQL to update the documents table schema in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update-documents-schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL to update documents table schema...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('Documents table schema updated successfully!');
    console.log('Result:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQL();
