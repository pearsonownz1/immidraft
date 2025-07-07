import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default async function handler(req: Request, res: Response) {
  const { expertId } = req.query;

  if (!expertId || typeof expertId !== 'string') {
    return res.status(400).json({ error: 'Expert ID is required' });
  }

  try {
    // Path to the expert's introduction file
    const introPath = path.join(process.cwd(), 'public', 'experts', expertId, 'intro.txt');
    
    // Check if the file exists
    if (!fs.existsSync(introPath)) {
      return res.status(404).json({ error: `Intro text not found for expert: ${expertId}` });
    }
    
    // Read the intro text
    const introText = fs.readFileSync(introPath, 'utf-8');
    
    // Return the intro text
    return res.status(200).json({ introText });
  } catch (error) {
    console.error('Error fetching expert intro text:', error);
    return res.status(500).json({ error: 'Failed to fetch expert intro text' });
  }
}
