// Simple test script to check if the experts API endpoint is working correctly
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    console.log('Testing experts API endpoint');
    
    // Path to the experts directory
    const expertsDir = path.join(process.cwd(), 'public', 'experts');
    console.log('Experts directory path:', expertsDir);
    
    // Check if the directory exists
    if (!fs.existsSync(expertsDir)) {
      console.log('Experts directory not found');
      return res.status(404).json({ error: 'Experts directory not found' });
    }
    
    // Get all expert directories
    const expertDirs = fs.readdirSync(expertsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('Found expert directories:', expertDirs);
    
    // Array to store expert data
    const experts = [];
    
    // Process each expert directory
    for (const expertId of expertDirs) {
      // Check for metadata.json
      const metadataPath = path.join(expertsDir, expertId, 'metadata.json');
      console.log(`Checking metadata for ${expertId} at ${metadataPath}`);
      
      // Check if metadata file exists
      if (fs.existsSync(metadataPath)) {
        try {
          // Read and parse metadata
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          console.log(`Metadata for ${expertId}:`, metadata);
          
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
        console.log(`No metadata file found for ${expertId}`);
        // Add expert with just the ID if no metadata file
        experts.push({
          id: expertId,
          name: expertId,
          title: '',
          organization: ''
        });
      }
    }
    
    console.log('Final experts list:', experts);
    
    // Return the list of experts
    return res.status(200).json({ experts });
  } catch (error) {
    console.error('Error fetching experts:', error);
    return res.status(500).json({ error: 'Failed to fetch experts', details: error.message });
  }
}
