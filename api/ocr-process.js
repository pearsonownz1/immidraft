const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

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
    console.log('Starting real OCR processing...');
    
    // Parse the multipart form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.document?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'No document file provided' 
      });
    }

    console.log('Processing file:', uploadedFile.originalFilename);
    console.log('File path:', uploadedFile.filepath);
    console.log('File size:', uploadedFile.size);

    // Read the file buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    
    // Process the document with real OCR
    const ocrResults = await processDocumentWithOCR(fileBuffer, uploadedFile.originalFilename);

    // Clean up the temporary file
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp file:', cleanupError);
    }

    return res.status(200).json({
      success: true,
      message: 'OCR processing completed',
      ocrResults,
      metadata: {
        filename: uploadedFile.originalFilename,
        size: uploadedFile.size,
        processingTime: Date.now(),
        totalElements: ocrResults.length,
        documentType: 'academic_transcript'
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'OCR processing failed: ' + error.message
    });
  }
}

async function processDocumentWithOCR(fileBuffer, filename) {
  try {
    // For now, we'll use a simple text extraction approach
    // In production, you would integrate with services like:
    // - Google Cloud Document AI
    // - AWS Textract
    // - Azure Form Recognizer
    // - Tesseract.js for client-side OCR
    
    console.log('Processing document with real OCR...');
    
    // Check if it's a PDF
    if (filename.toLowerCase().endsWith('.pdf')) {
      return await processPDF(fileBuffer);
    }
    
    // Check if it's an image
    if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
      return await processImage(fileBuffer);
    }
    
    throw new Error('Unsupported file format. Please upload a PDF or image file.');
    
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw error;
  }
}

async function processPDF(fileBuffer) {
  try {
    // For PDF processing, we would typically use pdf-parse or similar
    // For now, return an error indicating real OCR is needed
    throw new Error('PDF OCR processing requires external service integration. Please integrate with Google Cloud Document AI, AWS Textract, or similar service.');
  } catch (error) {
    throw error;
  }
}

async function processImage(fileBuffer) {
  try {
    // For image processing, we would typically use Tesseract.js or cloud services
    // For now, return an error indicating real OCR is needed
    throw new Error('Image OCR processing requires external service integration. Please integrate with Google Cloud Vision API, AWS Textract, or Tesseract.js.');
  } catch (error) {
    throw error;
  }
}

// Disable body parser for multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};
