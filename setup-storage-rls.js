// Script to set up Row Level Security (RLS) policies for the Supabase storage bucket
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageRLS() {
  try {
    console.log('Setting up RLS policies for the "documents" storage bucket...');
    
    // First, check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.error('Error: "documents" bucket not found. Please run create-storage-bucket.js first.');
      process.exit(1);
    }
    
    // SQL to set up RLS policies for the storage.objects table
    const sql = `
      -- Allow public read access to all files in the documents bucket
      CREATE POLICY "Allow public read access for documents" 
      ON storage.objects
      FOR SELECT 
      USING (bucket_id = 'documents');
      
      -- Allow authenticated users to upload files to the documents bucket
      CREATE POLICY "Allow authenticated users to upload files" 
      ON storage.objects
      FOR INSERT 
      TO authenticated
      WITH CHECK (bucket_id = 'documents');
      
      -- Allow users to update their own files
      CREATE POLICY "Allow users to update their own files" 
      ON storage.objects
      FOR UPDATE 
      TO authenticated
      USING (bucket_id = 'documents' AND owner = auth.uid())
      WITH CHECK (bucket_id = 'documents');
      
      -- Allow users to delete their own files
      CREATE POLICY "Allow users to delete their own files" 
      ON storage.objects
      FOR DELETE 
      TO authenticated
      USING (bucket_id = 'documents' AND owner = auth.uid());
    `;
    
    // Execute the SQL to create the policies
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
    
    if (sqlError) {
      // If the error is about the function not existing, we need to create it first
      if (sqlError.message.includes('function') && sqlError.message.includes('does not exist')) {
        console.log('Creating exec_sql function...');
        
        // Create the exec_sql function
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `;
        
        // Execute the SQL to create the function
        const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionSql });
        
        if (createFunctionError) {
          console.error('Error creating exec_sql function:', createFunctionError.message);
          console.log('You may need to run this SQL manually in the Supabase SQL editor:');
          console.log(sql);
          process.exit(1);
        }
        
        // Try executing the original SQL again
        const { error: retryError } = await supabase.rpc('exec_sql', { sql });
        
        if (retryError) {
          console.error('Error setting up RLS policies:', retryError.message);
          console.log('You may need to run this SQL manually in the Supabase SQL editor:');
          console.log(sql);
          process.exit(1);
        }
      } else {
        console.error('Error setting up RLS policies:', sqlError.message);
        console.log('You may need to run this SQL manually in the Supabase SQL editor:');
        console.log(sql);
        process.exit(1);
      }
    }
    
    console.log('RLS policies for the "documents" storage bucket set up successfully!');
    console.log('\nStorage bucket RLS setup complete!');
    console.log('Your storage bucket is now properly secured with the following policies:');
    console.log('1. Public read access to all files in the documents bucket');
    console.log('2. Authenticated users can upload files to the documents bucket');
    console.log('3. Users can update their own files');
    console.log('4. Users can delete their own files');
    
  } catch (error) {
    console.error('Error setting up storage RLS:', error.message);
    process.exit(1);
  }
}

setupStorageRLS();
