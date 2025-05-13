/**
 * Script to execute the evaluation letters schema SQL on Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, 'update-evaluation-letters-schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL schema for evaluation letters...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('SQL executed successfully!');
    console.log('Evaluation letters tables and policies created.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQL();
