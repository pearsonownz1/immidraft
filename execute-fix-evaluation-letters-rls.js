import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSQL() {
  try {
    console.log('Executing SQL to fix RLS policies for evaluation letters...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-evaluation-letters-rls.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('pgexecute', { query: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('RLS policies for evaluation letters fixed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

executeSQL();
