// This script opens the test-supabase.html file with the Supabase URL and key pre-filled
import 'dotenv/config';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as os from 'os';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase configuration from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

// Construct the URL with query parameters
const htmlPath = join(__dirname, 'public', 'test-supabase.html');
const url = `file://${htmlPath}?url=${encodeURIComponent(supabaseUrl)}&key=${encodeURIComponent(supabaseAnonKey)}`;

console.log('Opening test-supabase.html with Supabase configuration...');

// Open the URL in the default browser
const platform = os.platform();
let command;

if (platform === 'darwin') {  // macOS
  command = `open "${url}"`;
} else if (platform === 'win32') {  // Windows
  command = `start "" "${url}"`;
} else {  // Linux and others
  command = `xdg-open "${url}"`;
}

exec(command, (error) => {
  if (error) {
    console.error('Error opening browser:', error);
    process.exit(1);
  }
  console.log('Browser opened successfully.');
});
