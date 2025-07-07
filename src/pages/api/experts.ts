import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default async function handler(req: Request, res: Response) {
  try {
    // Path to the experts directory
    const expertsDir = path.join(process.cwd(), 'public', 'experts');
    
    // Check if the directory exists
    if (!fs.existsSync(expertsDir)) {
      return res.status(404).json({ error: 'Experts directory not found' });
    }
    
    // Get all expert directories
    const expertDirs = fs.readdirSync(expertsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Array to store expert data
    const experts = [];
    
    // Process each expert directory
    for (const expertId of expertDirs) {
      // Check for metadata.json or the introduction file
      const metadataPath = path.join(expertsDir, expertId, 'metadata.json');
      const introPath = path.join(expertsDir, expertId, 'intro.txt');
      
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
    
    // Return the list of experts
    return res.status(200).json({ experts });
  } catch (error) {
    console.error('Error fetching experts:', error);
    return res.status(500).json({ error: 'Failed to fetch experts' });
  }
}
