import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client with error handling
    let supabase;
    try {
      supabase = createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
    } catch (supabaseError) {
      console.error('Supabase initialization error:', supabaseError);
      return res.status(500).json({ 
        error: 'Storage service unavailable',
        details: 'Supabase configuration error'
      });
    }

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

    // Try to upload to Supabase 'documents' bucket with SSL error handling
    let uploadData = null;
    let uploadError = null;
    
    try {
      const result = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: false
        });
      
      uploadData = result.data;
      uploadError = result.error;
    } catch (sslError) {
      console.error('SSL/Network error during upload:', sslError);
      uploadError = { message: 'SSL connection failed' };
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // If upload failed due to SSL, continue with processing but log the issue
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      console.log('Continuing without storage due to SSL issues');
    }

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return OCR results
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
      fileUrl: uploadData?.path || null,
      metadata: {
        filename: file.originalFilename,
        size: file.size,
        processingTime: Date.now(),
        confidence: 91,
        storagePath: uploadData?.path || null,
        storageStatus: uploadError ? 'failed' : 'success',
        storageError: uploadError?.message || null
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({ 
      error: 'OCR processing failed',
      details: error.message || 'Unknown error'
    });
  }
}
