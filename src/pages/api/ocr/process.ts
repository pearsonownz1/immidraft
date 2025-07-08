import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.document) ? files.document[0] : files.document;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file buffer
    const buffer = fs.readFileSync(file.filepath);
    const fileName = `transcript_${Date.now()}_${file.originalFilename}`;

    // Upload to Supabase 'documents' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message 
      });
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Simulate OCR processing (replace with real OCR service later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate realistic OCR results for transcript
    const ocrResults = [
      { text: "Franklin Public Schools", confidence: 95, bbox: [100, 50, 400, 80], type: 'header' },
      { text: "Secondary School Record - Transcript", confidence: 92, bbox: [100, 90, 450, 120], type: 'header' },
      { text: "Name: Smith, Thomas", confidence: 94, bbox: [50, 180, 250, 200], type: 'text' },
      { text: "School Name/Address: FRANKLIN HIGH SCHOOL", confidence: 91, bbox: [400, 180, 650, 200], type: 'text' },
      { text: "Date of Birth: 1/2/01", confidence: 89, bbox: [50, 210, 180, 230], type: 'text' },
      { text: "Course Code", confidence: 93, bbox: [50, 300, 150, 320], type: 'cell' },
      { text: "Course Name", confidence: 91, bbox: [150, 300, 300, 320], type: 'cell' },
      { text: "Grade", confidence: 92, bbox: [400, 300, 450, 320], type: 'cell' },
      { text: "Credits", confidence: 90, bbox: [450, 300, 500, 320], type: 'cell' },
      { text: "1002", confidence: 87, bbox: [50, 350, 150, 370], type: 'cell' },
      { text: "English 9-H", confidence: 85, bbox: [150, 350, 300, 370], type: 'cell' },
      { text: "A", confidence: 96, bbox: [400, 350, 450, 370], type: 'cell' },
      { text: "1.0000", confidence: 92, bbox: [450, 350, 500, 370], type: 'cell' },
      { text: "1134", confidence: 86, bbox: [50, 380, 150, 400], type: 'cell' },
      { text: "Spanish II-CP", confidence: 84, bbox: [150, 380, 300, 400], type: 'cell' },
      { text: "A", confidence: 95, bbox: [400, 380, 450, 400], type: 'cell' },
      { text: "1.0000", confidence: 91, bbox: [450, 380, 500, 400], type: 'cell' }
    ];

    return res.status(200).json({
      success: true,
      ocrResults: ocrResults,
      fileUrl: uploadData.path,
      metadata: {
        filename: file.originalFilename,
        size: file.size,
        processingTime: Date.now(),
        confidence: 91,
        storagePath: uploadData.path
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({ 
      error: 'OCR processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
