import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default async function handler(req: Request, res: Response) {
  const { expertId } = req.query;

  if (!expertId || typeof expertId !== 'string') {
    return res.status(400).json({ error: 'Expert ID is required' });
  }

  try {
    // Path to the expert's metadata file
    const metadataPath = path.join(process.cwd(), 'public', 'experts', expertId, 'metadata.json');
    
    // Check if the file exists
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: `Expert not found: ${expertId}` });
    }
    
    // Read and parse the metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    
    // Return the expert data with ID
    return res.status(200).json({
      id: expertId,
      name: metadata.name || expertId,
      title: metadata.title || '',
      organization: metadata.organization || ''
    });
  } catch (error) {
    console.error(`Error fetching expert metadata for "${expertId}":`, error);
    return res.status(500).json({ error: 'Failed to fetch expert metadata' });
  }
}
