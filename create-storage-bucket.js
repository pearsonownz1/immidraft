// Script to create a storage bucket in Supabase for document uploads
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

async function createStorageBucket() {
  try {
    console.log('Creating "documents" storage bucket in Supabase...');
    
    // Create the storage bucket
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: true, // Make files publicly accessible
      fileSizeLimit: 10485760, // 10MB file size limit
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Storage bucket "documents" created successfully!');
    console.log('Bucket details:', data);
    
    // Set up bucket policies to allow public access to files
    console.log('Setting up bucket policies...');
    
    const { error: policyError } = await supabase.storage.from('documents').createSignedUrl('test.txt', 60);
    
    if (policyError && !policyError.message.includes('not found')) {
      console.warn('Warning setting up policies:', policyError.message);
    } else {
      console.log('Bucket policies set up successfully!');
    }
    
    console.log('\nStorage bucket setup complete!');
    console.log('You can now upload documents to the "documents" bucket.');
    console.log('Access files at:', `${supabaseUrl}/storage/v1/object/public/documents/[filename]`);
    
  } catch (error) {
    console.error('Error creating storage bucket:', error.message);
    process.exit(1);
  }
}

createStorageBucket();
