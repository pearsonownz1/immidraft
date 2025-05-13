/**
 * Educational Document Evaluation Service
 * This service handles the evaluation of educational documents (diplomas and transcripts)
 * using Azure Document Intelligence for text extraction and Gemini for structured data extraction
 * and US equivalency determination.
 */

import { documentProcessingService } from './documentProcessingService';

// Interface for course data
export interface CourseData {
  course_name: string;
  grade_received: string;
  us_grade?: string;
  credits?: number;
  semester_or_year?: string;
}

// Interface for structured diploma data
export interface DiplomaData {
  name: string;
  degree: string;
  field_of_study: string;
  university: string;
  graduation_date: string;
  diploma_issue_date: string;
  birth_date: string;
  birthplace: string;
  courses?: CourseData[];
  document_type?: 'diploma' | 'transcript';
}

// Interface for diploma evaluation result
export interface DiplomaEvaluationResult {
  extractedText: string;
  structuredData: DiplomaData | null;
  usEquivalency: string;
}

// Interface for saved evaluation file
export interface EvaluationFile {
  id: string;
  filename: string;
  originalUrl: string;
  extractedText: string;
  structuredData: DiplomaData | null;
  usEquivalency: string;
  uploadedAt: string;
  status: 'uploaded' | 'processed' | 'evaluated' | 'edited' | 'completed';
}

// Educational Document Evaluation Service
export const diplomaEvaluationService = {
  /**
   * Upload and process a document for evaluation
   * @param file File object to upload
   * @returns Processed document data with evaluation
   */
  uploadDocument: async (file: File): Promise<EvaluationFile> => {
    try {
      // Generate a unique ID for the evaluation file
      const id = crypto.randomUUID();
      
      // Upload and process the document using the document processing service
      const result = await documentProcessingService.uploadAndProcessDocument(file, 'documents');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process document');
      }
      
      // Create an evaluation file object with initial status
      const evaluationFile: EvaluationFile = {
        id,
        filename: file.name,
        originalUrl: result.publicUrl,
        extractedText: result.extractedText || '',
        structuredData: null,
        usEquivalency: '',
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };
      
      // Store the evaluation file in local storage for persistence
      const existingFiles = await diplomaEvaluationService.getEvaluationFiles();
      existingFiles.push(evaluationFile);
      localStorage.setItem('evaluationFiles', JSON.stringify(existingFiles));
      
      return evaluationFile;
    } catch (error: any) {
      console.error('Error uploading document for evaluation:', error);
      throw error;
    }
  },
  
  /**
   * Process the uploaded document and generate evaluation
   * @param evaluationFileId ID of the evaluation file
   * @returns Updated evaluation file with results
   */
  processEvaluation: async (evaluationFileId: string): Promise<EvaluationFile> => {
    try {
      // Get the evaluation file
      const evaluationFile = await diplomaEvaluationService.getEvaluationFileById(evaluationFileId);
      
      if (!evaluationFile) {
        throw new Error('Evaluation file not found');
      }
      
      // Detect document type
      const documentType = diplomaEvaluationService.detectDocumentType(evaluationFile.extractedText);
      
      // Extract structured data
      const structuredData = await diplomaEvaluationService.extractStructuredData(
        evaluationFile.extractedText, 
        documentType
      );
      
      // Determine US equivalency
      const usEquivalency = await diplomaEvaluationService.determineUSEquivalency(
        evaluationFile.extractedText, 
        structuredData
      );
      
      // Update the evaluation file
      const updatedFile: EvaluationFile = {
        ...evaluationFile,
        structuredData,
        usEquivalency,
        status: 'evaluated'
      };
      
      // Save the updated file
      await diplomaEvaluationService.updateEvaluationFile(updatedFile);
      
      return updatedFile;
    } catch (error: any) {
      console.error('Error processing evaluation:', error);
      throw error;
    }
  },
  
  /**
   * Update an evaluation file
   * @param evaluationFile Updated evaluation file
   * @returns Success status
   */
  updateEvaluationFile: async (evaluationFile: EvaluationFile): Promise<boolean> => {
    try {
      const existingFiles = await diplomaEvaluationService.getEvaluationFiles();
      const fileIndex = existingFiles.findIndex(file => file.id === evaluationFile.id);
      
      if (fileIndex === -1) {
        throw new Error('Evaluation file not found');
      }
      
      existingFiles[fileIndex] = evaluationFile;
      localStorage.setItem('evaluationFiles', JSON.stringify(existingFiles));
      
      return true;
    } catch (error: any) {
      console.error('Error updating evaluation file:', error);
      return false;
    }
  },
  
  /**
   * Get all evaluation files
   * @returns Array of evaluation files
   */
  getEvaluationFiles: async (): Promise<EvaluationFile[]> => {
    try {
      const filesJson = localStorage.getItem('evaluationFiles');
      return filesJson ? JSON.parse(filesJson) : [];
    } catch (error: any) {
      console.error('Error getting evaluation files:', error);
      return [];
    }
  },
  
  /**
   * Get an evaluation file by ID
   * @param evaluationFileId ID of the evaluation file
   * @returns Evaluation file
   */
  getEvaluationFileById: async (evaluationFileId: string): Promise<EvaluationFile | null> => {
    try {
      const existingFiles = await diplomaEvaluationService.getEvaluationFiles();
      return existingFiles.find(file => file.id === evaluationFileId) || null;
    } catch (error: any) {
      console.error('Error getting evaluation file by ID:', error);
      return null;
    }
  },
  
  /**
   * Delete an evaluation file
   * @param evaluationFileId ID of the evaluation file
   * @returns Success status
   */
  deleteEvaluationFile: async (evaluationFileId: string): Promise<boolean> => {
    try {
      const existingFiles = await diplomaEvaluationService.getEvaluationFiles();
      const updatedFiles = existingFiles.filter(file => file.id !== evaluationFileId);
      localStorage.setItem('evaluationFiles', JSON.stringify(updatedFiles));
      return true;
    } catch (error: any) {
      console.error('Error deleting evaluation file:', error);
      return false;
    }
  },
  
  /**
   * Generate a downloadable report for an evaluation file
   * @param evaluationFileId ID of the evaluation file
   * @param format Format of the report ('pdf' or 'docx')
   * @returns URL of the generated report
   */
  generateReport: async (
    evaluationFileId: string,
    format: 'pdf' | 'docx' = 'pdf'
  ): Promise<string> => {
    try {
      const existingFiles = await diplomaEvaluationService.getEvaluationFiles();
      const file = existingFiles.find(f => f.id === evaluationFileId);
      
      if (!file) {
        throw new Error('Evaluation file not found');
      }
      
      // Update the file status
      const updatedFiles = existingFiles.map(f => {
        if (f.id === evaluationFileId) {
          return {
            ...f,
            status: 'completed' as const
          };
        }
        return f;
      });
      
      localStorage.setItem('evaluationFiles', JSON.stringify(updatedFiles));
      
      // In a real implementation, this would generate a PDF or DOCX file
      // For now, we'll just return a mock URL
      return `data:application/octet-stream;base64,${btoa(JSON.stringify({
        filename: file.filename,
        extractedText: file.extractedText,
        structuredData: file.structuredData,
        usEquivalency: file.usEquivalency,
        timestamp: new Date().toISOString()
      }))}`;
    } catch (error: any) {
      console.error('Error generating report:', error);
      throw error;
    }
  },
  /**
   * Detect document type (diploma or transcript) based on content
   * @param text Extracted text from the document
   * @returns 'diploma' or 'transcript'
   */
  detectDocumentType: (text: string): 'diploma' | 'transcript' => {
    // Look for common transcript indicators
    const transcriptIndicators = [
      /course(?:s)?\s+(?:list|catalog|schedule)/i,
      /grade(?:s)?\s+(?:received|earned|awarded)/i,
      /credit(?:s)?\s+(?:hour|earned|attempted)/i,
      /transcript\s+of\s+(?:record|academic)/i,
      /semester|quarter|term/i,
      /gpa|grade\s+point\s+average/i,
      /academic\s+record/i,
      /course\s+number/i,
      /department\s+code/i
    ];
    
    // Check if any transcript indicators are present
    for (const indicator of transcriptIndicators) {
      if (indicator.test(text)) {
        return 'transcript';
      }
    }
    
    // Default to diploma if no transcript indicators found
    return 'diploma';
  },

  /**
   * Process an educational document (diploma or transcript)
   * @param fileUrl URL of the document file
   * @param fileName Name of the document file
   * @returns Promise resolving to a DiplomaEvaluationResult
   */
  evaluateDiploma: async (fileUrl: string, fileName: string): Promise<DiplomaEvaluationResult> => {
    try {
      // Step 1: Extract text from the document using Azure Document Intelligence
      const documentId = crypto.randomUUID();
      const processResult = await documentProcessingService.processDocument(
        documentId,
        fileUrl,
        "educational_document",
        fileName
      );

      if (!processResult || !processResult.extracted_text) {
        throw new Error("Failed to extract text from document");
      }

      const extractedText = processResult.extracted_text;
      
      // Step 2: Detect document type (diploma or transcript)
      const documentType = diplomaEvaluationService.detectDocumentType(extractedText);
      console.log(`Detected document type: ${documentType}`);

      // Step 3: Extract structured data from the text
      const structuredData = await diplomaEvaluationService.extractStructuredData(extractedText, documentType);
      
      // Step 4: Determine US equivalency
      const usEquivalency = await diplomaEvaluationService.determineUSEquivalency(extractedText, structuredData);

      return {
        extractedText,
        structuredData,
        usEquivalency
      };
    } catch (error) {
      console.error("Error evaluating educational document:", error);
      throw error;
    }
  },

  /**
   * Extract structured data from educational document text
   * @param extractedText Text extracted from the document
   * @param documentType Type of document ('diploma' or 'transcript')
   * @returns Promise resolving to DiplomaData or null
   */
  extractStructuredData: async (extractedText: string, documentType: 'diploma' | 'transcript'): Promise<DiplomaData | null> => {
    try {
      // Create a prompt for the LLM to extract structured data
      let prompt = '';
      
      if (documentType === 'transcript') {
        // Transcript-specific prompt with focus on courses
        prompt = `
        You are analyzing an academic transcript. Extract the following structured fields from the transcript text below. Respond only in JSON format:
        - name (student's full name)
        - degree (degree program the student is enrolled in)
        - field_of_study (major or specialization)
        - university (institution name)
        - graduation_date (if available)
        - courses (an array of course objects, each containing:)
          - course_name (full course name)
          - grade_received (letter grade or numerical grade)
          - us_grade (the US equivalent grade on A, B, C, D, F scale)
          - credits (number of credits for the course, if available)
          - semester_or_year (when the course was taken, if available)

        IMPORTANT: 
        1. The main focus should be on accurately extracting ALL courses listed in the transcript with their grades and credits.
        2. For each course, provide the US equivalent grade (A, B+, B, C+, C, D, F) based on the foreign grading system.
        3. Pay special attention to any tabular data or lists in the document that contain course information.
        4. Look for patterns like course codes followed by course names, grades, and credit hours.
        
        Include the document_type field with value "transcript" in your response.
        `;
      } else {
        // Diploma-specific prompt with focus on degree information
        prompt = `
        You are analyzing a diploma or degree certificate. Extract the following structured fields from the diploma text below. Respond only in JSON format:
        - name (graduate's full name)
        - degree (complete degree title)
        - field_of_study (major, specialization or field)
        - university (full institution name)
        - graduation_date (when the degree was conferred)
        - diploma_issue_date (when the diploma document was issued, if different from graduation date)
        - birth_date (if mentioned)
        - birthplace (if mentioned)
        - courses (an array of course objects if any courses are listed, each containing:)
          - course_name
          - grade_received
          - credits (if available)
          - semester_or_year (if available)
        
        Include the document_type field with value "diploma" in your response.
        `;
      }
      
      // Add common instructions to both prompts
      prompt += `
        Example format:
        
        Example format:
        {
          "name": "John Smith",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science",
          "university": "Example University",
          "graduation_date": "May 2023",
          "diploma_issue_date": "June 15, 2023",
          "birth_date": "January 1, 2000",
          "birthplace": "New York, NY",
          "courses": [
            {
              "course_name": "Introduction to Programming",
              "grade_received": "A",
              "credits": 3,
              "semester_or_year": "Fall 2019"
            },
            {
              "course_name": "Data Structures",
              "grade_received": "B+",
              "credits": 4,
              "semester_or_year": "Spring 2020"
            }
          ]
        }

        Text:
        """${extractedText}"""
      `;

      // Call the API endpoint
      const response = await fetch("/api/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "diploma_structured_data",
          documentName: "Diploma Structured Data",
          documentText: extractedText,
          prompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the JSON response
      try {
        // The summary field should contain the JSON string
        const jsonStr = data.summary || "{}";
        // Try to parse it as JSON
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Error parsing structured data JSON:", parseError);
        return null;
      }
    } catch (error) {
      console.error("Error extracting structured data:", error);
      return null;
    }
  },

  /**
   * Determine US equivalency of an educational document
   * @param extractedText Text extracted from the document
   * @param structuredData Structured data extracted from the document
   * @returns Promise resolving to a string with the US equivalency
   */
  determineUSEquivalency: async (extractedText: string, structuredData: DiplomaData | null): Promise<string> => {
    try {
      const documentType = structuredData?.document_type || 'diploma';
      
      // Create a prompt for the LLM that includes structured data if available
      let prompt = '';
      
      if (documentType === 'transcript') {
        prompt = `
          You are an expert in international education credential evaluation.
          
          Please analyze the following academic transcript and provide:
          
          1. A detailed evaluation of the courses and grades listed in the transcript
          2. The US equivalent GPA (on a 4.0 scale) based on the grades shown
          3. An assessment of the academic standing (e.g., good standing, honors, etc.)
          4. The US equivalent of the degree program (if identifiable from the transcript)
          5. Any notable strengths or weaknesses in the academic record
          
          Format your response as a formal credential evaluation report.
          
          Transcript text:
          ${extractedText}
        `;
      } else {
        prompt = `
          You are an expert in international education credential evaluation.
          
          Please analyze the following diploma/degree text and determine its US equivalency.
          Consider the institution, program length, courses, and any other relevant information.
          
          Provide a clear statement of the US equivalent degree (e.g., "Bachelor of Science in Computer Science", 
          "Master of Arts in Economics", etc.) and a brief explanation of your reasoning.
          
          Diploma text:
          ${extractedText}
        `;
      }
      
      // If we have structured data, include it in the prompt
      if (structuredData) {
        prompt += `\n\nExtracted structured data:
        Name: ${structuredData.name || 'Unknown'}
        Degree: ${structuredData.degree || 'Unknown'}
        Field of Study: ${structuredData.field_of_study || 'Unknown'}
        University: ${structuredData.university || 'Unknown'}
        Graduation Date: ${structuredData.graduation_date || 'Unknown'}
        Diploma Issue Date: ${structuredData.diploma_issue_date || 'Unknown'}
        Birth Date: ${structuredData.birth_date || 'Unknown'}
        Birthplace: ${structuredData.birthplace || 'Unknown'}
        `;
        
        // Include courses if available
        if (structuredData.courses && structuredData.courses.length > 0) {
          prompt += `\nCourses:\n`;
          structuredData.courses.forEach((course, index) => {
            prompt += `${index + 1}. ${course.course_name} - Grade: ${course.grade_received}`;
            if (course.credits !== undefined) prompt += `, Credits: ${course.credits}`;
            if (course.semester_or_year) prompt += `, ${course.semester_or_year}`;
            prompt += '\n';
          });
        }
      }

      // Call the API endpoint
      const response = await fetch("/api/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "diploma_evaluation",
          documentName: "Diploma Evaluation",
          documentText: extractedText,
          prompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.summary || "Unable to determine US equivalency";
    } catch (error) {
      console.error("Error generating US equivalency:", error);
      return "Error generating US equivalency: " + (error as Error).message;
    }
  }
};

export default diplomaEvaluationService;
