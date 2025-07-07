// This is a simple test script to verify that the expert intro text API works correctly

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to simulate the API endpoint
export function getExpertIntro(expertId) {
  try {
    // Path to the expert's introduction file
    const introPath = path.join(process.cwd(), 'public', 'experts', expertId, 'intro.txt');
    
    // Check if the file exists
    if (!fs.existsSync(introPath)) {
      console.error(`Intro text not found for expert: ${expertId}`);
      return null;
    }
    
    // Read the intro text
    const introText = fs.readFileSync(introPath, 'utf-8');
    return introText;
  } catch (error) {
    console.error('Error fetching expert intro text:', error);
    return null;
  }
}

// Function to list all available experts
export function listExperts() {
  try {
    // Path to the experts directory
    const expertsDir = path.join(process.cwd(), 'public', 'experts');
    
    // Check if the directory exists
    if (!fs.existsSync(expertsDir)) {
      console.error('Experts directory not found');
      return [];
    }
    
    // Get all expert directories
    const expertDirs = fs.readdirSync(expertsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Array to store expert data
    const experts = [];
    
    // Process each expert directory
    for (const expertId of expertDirs) {
      const metadataPath = path.join(expertsDir, expertId, 'metadata.json');
      
      // Check if metadata file exists
      if (fs.existsSync(metadataPath)) {
        try {
          // Read and parse metadata
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          
          // Add expert data with ID
          experts.push({
            id: expertId,
            name: metadata.name || expertId,
            title: metadata.title || '',
            organization: metadata.organization || ''
          });
        } catch (error) {
          console.error(`Error parsing metadata for expert ${expertId}:`, error);
          // Add expert with just the ID if metadata parsing fails
          experts.push({
            id: expertId,
            name: expertId,
            title: '',
            organization: ''
          });
        }
      } else {
        // Add expert with just the ID if no metadata file
        experts.push({
          id: expertId,
          name: expertId,
          title: '',
          organization: ''
        });
      }
    }
    
    return experts;
  } catch (error) {
    console.error('Error fetching experts:', error);
    return [];
  }
}

// Run the test
export function runTest() {
  console.log('Testing Expert Selection Feature');
  console.log('===============================');
  
  // List all experts
  const experts = listExperts();
  console.log(`Found ${experts.length} experts:`);
  experts.forEach(expert => {
    console.log(`- ${expert.name} (${expert.id})`);
  });
  
  console.log('\nTesting intro text retrieval:');
  // Test getting intro text for each expert
  for (const expert of experts) {
    const introText = getExpertIntro(expert.id);
    if (introText) {
      console.log(`\n${expert.name} intro text (first 100 chars):`);
      console.log(introText.substring(0, 100) + '...');
    } else {
      console.log(`\n${expert.name}: No intro text found`);
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
}
