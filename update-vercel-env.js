// This script updates the Vercel environment variables with the Supabase configuration
import 'dotenv/config';
import { execSync } from 'child_process';

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Vercel CLI is not installed. Please install it with: npm i -g vercel');
  process.exit(1);
}

// Get Supabase configuration from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseProjectId = process.env.SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

console.log('Updating Vercel environment variables with Supabase configuration...');

// Update Vercel environment variables
try {
  // Add Supabase URL
  execSync(`vercel env add VITE_SUPABASE_URL production`, { stdio: 'inherit' });
  
  // Add Supabase Anon Key
  execSync(`vercel env add VITE_SUPABASE_ANON_KEY production`, { stdio: 'inherit' });
  
  // Add Supabase Project ID if available
  if (supabaseProjectId) {
    execSync(`vercel env add SUPABASE_PROJECT_ID production`, { stdio: 'inherit' });
  }
  
  console.log('\nVercel environment variables updated successfully.');
  console.log('\nNow you need to deploy your application with:');
  console.log('  vercel --prod');
  
} catch (error) {
  console.error('Error updating Vercel environment variables:', error);
  process.exit(1);
}
