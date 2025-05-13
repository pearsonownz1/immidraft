// This script checks if the Vercel deployment has the correct environment variables set
import 'dotenv/config';
import { execSync } from 'child_process';

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Vercel CLI is not installed. Please install it with: npm i -g vercel');
  process.exit(1);
}

console.log('Checking Vercel environment variables...');

// Get environment variables from Vercel
try {
  console.log('\nFetching environment variables from Vercel...');
  const envOutput = execSync('vercel env ls', { encoding: 'utf-8' });
  
  // Check if Supabase environment variables are set
  const hasSuperbaseUrl = envOutput.includes('VITE_SUPABASE_URL');
  const hasSupabaseAnonKey = envOutput.includes('VITE_SUPABASE_ANON_KEY');
  
  console.log('\nResults:');
  console.log(`VITE_SUPABASE_URL: ${hasSuperbaseUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${hasSupabaseAnonKey ? '✅ Set' : '❌ Not set'}`);
  
  if (!hasSuperbaseUrl || !hasSupabaseAnonKey) {
    console.log('\n⚠️ Some Supabase environment variables are missing.');
    console.log('Run the update-vercel-env.js script to set them:');
    console.log('  node update-vercel-env.js');
  } else {
    console.log('\n✅ All Supabase environment variables are set correctly.');
  }
  
  // Check deployment URL
  console.log('\nFetching deployment URL...');
  const deploymentOutput = execSync('vercel ls --prod', { encoding: 'utf-8' });
  const deploymentLines = deploymentOutput.split('\n');
  
  // Find the line with the deployment URL
  const deploymentLine = deploymentLines.find(line => line.includes('immidraft'));
  if (deploymentLine) {
    const parts = deploymentLine.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const deploymentUrl = parts[1];
      console.log(`Deployment URL: ${deploymentUrl}`);
    }
  }
  
} catch (error) {
  console.error('Error checking Vercel environment variables:', error);
  process.exit(1);
}
