import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

// Mock PaddleOCR processing - replace with actual PaddleOCR integration
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.document) ? files.document[0] : files.document;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Mock OCR results - replace with actual PaddleOCR processing
    const mockOCRResults = [
      {
        text: "Franklin Public Schools",
        confidence: 0.95,
        bbox: [100, 50, 400, 80]
      },
      {
        text: "Secondary School Record - Transcript",
        confidence: 0.92,
        bbox: [100, 90, 450, 120]
      },
      {
        text: "STUDENT INFORMATION",
        confidence: 0.88,
        bbox: [50, 150, 200, 170]
      },
      {
        text: "Name: Smith, Thomas",
        confidence: 0.94,
        bbox: [50, 180, 250, 200]
      },
      {
        text: "School Name/Address: FRANKLIN HIGH SCHOOL",
        confidence: 0.91,
        bbox: [400, 180, 650, 200]
      },
      {
        text: "Date of Birth: 1/2/01",
        confidence: 0.89,
        bbox: [50, 210, 180, 230]
      },
      {
        text: "9th Grade 2017-2018",
        confidence: 0.93,
        bbox: [50, 300, 200, 320]
      },
      {
        text: "1002 English 9-H",
        confidence: 0.87,
        bbox: [50, 350, 150, 370]
      },
      {
        text: "Honors",
        confidence: 0.85,
        bbox: [200, 350, 250, 370]
      },
      {
        text: "A",
        confidence: 0.96,
        bbox: [300, 350, 320, 370]
      },
      {
        text: "1.0000",
        confidence: 0.92,
        bbox: [350, 350, 400, 370]
      },
      {
        text: "1134 CP Spanish II-CP",
        confidence: 0.86,
        bbox: [50, 380, 180, 400]
      },
      {
        text: "Coll Prep",
        confidence: 0.84,
        bbox: [200, 380, 260, 400]
      },
      {
        text: "A",
        confidence: 0.95,
        bbox: [300, 380, 320, 400]
      },
      {
        text: "1.0000",
        confidence: 0.91,
        bbox: [350, 380, 400, 400]
      }
    ];

    // Clean up uploaded file
    if (file.filepath) {
      fs.unlinkSync(file.filepath);
    }

    res.status(200).json({
      success: true,
      ocrResults: mockOCRResults,
      metadata: {
        filename: file.originalFilename,
        size: file.size,
        processingTime: Date.now(),
        confidence: 0.91
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
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
