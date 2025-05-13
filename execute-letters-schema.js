// Script to execute the letters schema SQL file
import { execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize dotenv
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if Supabase URL and key are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

console.log('Executing letters schema SQL file...');

try {
  // Read the SQL file
  const sqlContent = fs.readFileSync('./update-letters-schema.sql', 'utf8');
  
  // Create a temporary file with the SQL content
  const tempFile = 'temp-letters-schema.sql';
  fs.writeFileSync(tempFile, sqlContent);
  
  // Execute the SQL using the Supabase CLI
  console.log('Running SQL commands...');
  execSync(`cat ${tempFile} | supabase db execute`, { stdio: 'inherit' });
  
  // Clean up the temporary file
  fs.unlinkSync(tempFile);
  
  console.log('Letters schema successfully updated!');
} catch (error) {
  console.error('Error executing SQL file:', error.message);
  process.exit(1);
}
