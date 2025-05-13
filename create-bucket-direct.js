// Script to directly create a storage bucket in Supabase using the REST API
import 'dotenv/config';
import fetch from 'node-fetch';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

// Function to create the bucket using the REST API
async function createBucketDirect() {
  try {
    console.log('Creating "documents" storage bucket in Supabase using direct API call...');
    
    // First, check if the bucket already exists
    const checkResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (checkResponse.status === 200) {
      console.log('Bucket "documents" already exists.');
      return true;
    }
    
    // Create the bucket
    const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        id: 'documents',
        name: 'documents',
        public: true,
        file_size_limit: 10485760 // 10MB
      })
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create bucket: ${JSON.stringify(errorData)}`);
    }
    
    const data = await createResponse.json();
    console.log('Storage bucket "documents" created successfully!');
    console.log('Bucket details:', data);
    
    // Set up RLS policies for the bucket
    console.log('Setting up RLS policies for the bucket...');
    
    // Allow public read access
    const readPolicyResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/documents/policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'Allow public read access',
        definition: {
          bucket_id: 'documents'
        },
        operation: 'SELECT',
        role: 'anon'
      })
    });
    
    if (!readPolicyResponse.ok) {
      console.warn('Warning: Failed to create read policy. This may be because it already exists.');
    } else {
      console.log('Read policy created successfully.');
    }
    
    // Allow authenticated users to upload files
    const insertPolicyResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/documents/policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'Allow authenticated users to upload files',
        definition: {
          bucket_id: 'documents'
        },
        operation: 'INSERT',
        role: 'authenticated'
      })
    });
    
    if (!insertPolicyResponse.ok) {
      console.warn('Warning: Failed to create insert policy. This may be because it already exists.');
    } else {
      console.log('Insert policy created successfully.');
    }
    
    // Allow users to update their own files
    const updatePolicyResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/documents/policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'Allow users to update their own files',
        definition: {
          bucket_id: 'documents',
          owner: 'auth.uid()'
        },
        operation: 'UPDATE',
        role: 'authenticated'
      })
    });
    
    if (!updatePolicyResponse.ok) {
      console.warn('Warning: Failed to create update policy. This may be because it already exists.');
    } else {
      console.log('Update policy created successfully.');
    }
    
    // Allow users to delete their own files
    const deletePolicyResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/documents/policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'Allow users to delete their own files',
        definition: {
          bucket_id: 'documents',
          owner: 'auth.uid()'
        },
        operation: 'DELETE',
        role: 'authenticated'
      })
    });
    
    if (!deletePolicyResponse.ok) {
      console.warn('Warning: Failed to create delete policy. This may be because it already exists.');
    } else {
      console.log('Delete policy created successfully.');
    }
    
    console.log('\nStorage bucket setup complete!');
    console.log('You can now upload documents to the "documents" bucket.');
    console.log('Access files at:', `${supabaseUrl}/storage/v1/object/public/documents/[filename]`);
    
    return true;
  } catch (error) {
    console.error('Error creating storage bucket:', error.message);
    return false;
  }
}

// Execute the function
createBucketDirect().then(success => {
  if (success) {
    console.log('Bucket creation process completed successfully.');
  } else {
    console.error('Bucket creation process failed.');
    process.exit(1);
  }
});
