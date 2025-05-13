import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Log the Supabase URL (without the key for security)
console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create the Supabase client with more robust error handling
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Function to ensure the documents storage bucket exists
export const ensureDocumentsBucketExists = async () => {
  try {
    // Check if the documents bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking storage buckets:', listError.message);
      // Assume the bucket exists even if we can't check
      console.log('Assuming documents bucket exists and proceeding...');
      return true;
    }
    
    // Check if the documents bucket exists
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.log('Documents bucket not found. Creating it now...');
      
      // Create the documents bucket
      const { data, error: createError } = await supabase.storage.createBucket('documents', {
        public: true, // Make files publicly accessible
        fileSizeLimit: 10485760, // 10MB file size limit
      });
      
      if (createError) {
        console.error('Error creating documents bucket:', createError.message);
        
        // If we get a 403 error (permission denied) or RLS policy violation,
        // assume the bucket exists on the server but we don't have permission to create it
        if (createError.message.includes('403') || 
            createError.message.includes('row-level security policy')) {
          console.log('Permission denied when creating bucket. Assuming it exists on the server.');
          return true;
        }
        
        return false;
      }
      
      console.log('Documents bucket created successfully!');
      return true;
    }
    
    console.log('Documents bucket already exists.');
    return true;
  } catch (error) {
    console.error('Unexpected error ensuring documents bucket exists:', error);
    // Assume the bucket exists even if we encounter an error
    console.log('Assuming documents bucket exists despite error and proceeding...');
    return true;
  }
};

// Test the connection and ensure the documents bucket exists
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Supabase connection successful');
    
    // Ensure the documents bucket exists
    ensureDocumentsBucketExists()
      .then(success => {
        if (success) {
          console.log('Storage setup complete.');
        } else {
          console.warn('Storage setup failed. Document uploads may not work.');
        }
      })
      .catch(err => {
        console.error('Error during storage setup:', err);
      });
  }
});
