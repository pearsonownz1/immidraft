import { saveAs } from 'file-saver';
// @ts-ignore
import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
import { format } from 'date-fns';
import { aiService } from './aiService';
import { documentProcessingService } from './documentProcessingService';
import { supabase, ensureDocumentsBucketExists } from '@/lib/supabase';

// API endpoint for AI processing
const API_ENDPOINT = '/api/process-document';

// Types
export interface EvaluationLetterData {
  id?: string;
  user_id?: string;
  case_id?: string;
  client_name: string;
  university: string;
  country: string;
  bachelor_degree: string;
  degree_date1: string;
  us_equivalent_degree1: string;
  additional_degree: boolean;
  university2?: string;
  degree_date2?: string;
  us_equivalent_degree2?: string;
  university_location: string;
  field_of_study: string;
  program_length1: string;
  university2_location?: string;
  field_of_study2?: string;
  program_length2?: string;
  years: string;
  specialty: string;
  work_experience_summary: string[];
  accreditation_body: string;
  degree_level: string;
  original_documents?: any;
  extracted_text?: any;
  ai_summary?: any;
  final_letter_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UploadedDocument {
  id?: string;
  evaluation_letter_id?: string;
  user_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  extracted_text?: string;
  document_type?: string;
  processed?: boolean;
  processing_error?: string;
  created_at?: string;
  updated_at?: string;
}

// Gemini system prompt for extracting data from documents
const GEMINI_SYSTEM_PROMPT = `
You are extracting academic evaluation data from this document text.

Only return values that are EXPLICITLY stated in the text. If a value is not clearly mentioned, set it to null.

Return the following JSON object with these fields:

{
  "fullName": null,
  "fieldOfExpertise": null,
  "yearsExperience": null,
  "primaryDegree": {
    "name": null,
    "university": null,
    "country": null,
    "graduationYear": null,
    "equivalent": null,
    "field": null
  },
  "additionalDegree": {
    "name": null,
    "university": null,
    "graduationYear": null,
    "equivalent": null,
    "field": null
  },
  "workExperience": []
}

CRITICAL INSTRUCTIONS:
1. Return ONLY raw JSON. No code blocks, markdown formatting, or explanations.
2. DO NOT invent, guess, or hallucinate any missing values.
3. If information is not explicitly stated in the document, leave the field as null.
4. Do not use placeholder names, fictional data, or default values.
5. The entire response must be parseable by JSON.parse().
6. For workExperience, only include items explicitly mentioned in the document.
7. If no work experience is mentioned, return an empty array.
8. Do not attempt to infer information that isn't clearly stated.

Only return valid JSON with null values for any fields not explicitly found in the document.
`;

class EvaluationLetterService {
  /**
   * Create a new evaluation letter record
   */
  async createEvaluationLetter(data: Partial<EvaluationLetterData>) {
    const { data: letter, error } = await supabase
      .from('evaluation_letters')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating evaluation letter:', error);
      throw error;
    }

    return letter;
  }

  /**
   * Get an evaluation letter by ID
   */
  async getEvaluationLetterById(id: string) {
    const { data: letter, error } = await supabase
      .from('evaluation_letters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching evaluation letter:', error);
      throw error;
    }

    return letter;
  }

  /**
   * Update an evaluation letter
   */
  async updateEvaluationLetter(id: string, data: Partial<EvaluationLetterData>) {
    const { data: letter, error } = await supabase
      .from('evaluation_letters')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating evaluation letter:', error);
      throw error;
    }

    return letter;
  }

  /**
   * Delete an evaluation letter
   */
  async deleteEvaluationLetter(id: string) {
    const { error } = await supabase
      .from('evaluation_letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting evaluation letter:', error);
      throw error;
    }

    return true;
  }

  /**
   * Get all evaluation letters for the current user
   */
  async getUserEvaluationLetters() {
    const { data: letters, error } = await supabase
      .from('evaluation_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluation letters:', error);
      throw error;
    }

    return letters;
  }

  /**
   * Upload a document for an evaluation letter
   */
  async uploadDocument(evaluationLetterId: string, file: File, documentType: string) {
    try {
      // Ensure the documents bucket exists before uploading
      const bucketExists = await ensureDocumentsBucketExists();
      if (!bucketExists) {
        throw new Error("Failed to create storage bucket. Please try again.");
      }
      
      // Create a unique file path - sanitize the filename to remove special characters
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `evaluation-letters/${evaluationLetterId}/${timestamp}-${sanitizedFileName}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading document:', uploadError);
        throw uploadError;
      }

      // Create a record in the evaluation_letter_documents table
      const documentData: Partial<UploadedDocument> = {
        evaluation_letter_id: evaluationLetterId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        document_type: documentType,
        processed: false
      };

      const { data: document, error: documentError } = await supabase
        .from('evaluation_letter_documents')
        .insert([documentData])
        .select()
        .single();

      if (documentError) {
        console.error('Error creating document record:', documentError);
        throw documentError;
      }

      return document;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  /**
   * Process uploaded documents using Azure Document Intelligence
   */
  async processDocuments(evaluationLetterId: string) {
    try {
      // Get all unprocessed documents for this evaluation letter
      const { data: documents, error: documentsError } = await supabase
        .from('evaluation_letter_documents')
        .select('*')
        .eq('evaluation_letter_id', evaluationLetterId)
        .eq('processed', false);

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      if (!documents || documents.length === 0) {
        return { message: 'No documents to process' };
      }

      // Process each document
      const processedDocuments = [];
      const extractedTextResults = {};

      for (const document of documents) {
        try {
          // Get the document URL
          const { data: fileData } = await supabase.storage
            .from('documents')
            .createSignedUrl(document.file_path, 3600);

          if (!fileData || !fileData.signedUrl) {
            throw new Error('Could not generate signed URL for document');
          }

          // Process the document with Azure Document Intelligence
          const extractedText = await documentProcessingService.processDocument(
            document.id,
            fileData.signedUrl,
            document.document_type || 'unknown',
            document.file_name
          );

          // Update the document record
          const { data: updatedDocument, error: updateError } = await supabase
            .from('evaluation_letter_documents')
            .update({
              extracted_text: extractedText.extracted_text,
              processed: true
            })
            .eq('id', document.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          processedDocuments.push(updatedDocument);
          extractedTextResults[document.file_name] = extractedText.extracted_text;
        } catch (error) {
          console.error(`Error processing document ${document.id}:`, error);
          
          // Update the document with the error
          await supabase
            .from('evaluation_letter_documents')
            .update({
              processing_error: error.message || 'Unknown error',
              processed: true
            })
            .eq('id', document.id);
        }
      }

      // Return the processed documents
      return {
        processedDocuments,
        extractedTextResults
      };
    } catch (error) {
      console.error('Error in processDocuments:', error);
      throw error;
    }
  }

  /**
   * Extract structured data from processed documents using Gemini
   */
  async extractDataWithAI(evaluationLetterId: string) {
    try {
      // Get all processed documents for this evaluation letter
      const { data: documents, error: documentsError } = await supabase
        .from('evaluation_letter_documents')
        .select('*')
        .eq('evaluation_letter_id', evaluationLetterId)
        .eq('processed', true);

      if (documentsError) {
        console.error('Error fetching processed documents:', documentsError);
        throw documentsError;
      }

      if (!documents || documents.length === 0) {
        return { message: 'No processed documents found' };
      }

      // Combine all extracted text
      const combinedText = documents.map(doc => {
        return `Document: ${doc.file_name}\n${doc.extracted_text || 'No text extracted'}\n\n`;
      }).join('\n');

      // Use Gemini to extract structured data
      const aiResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'evaluation_letter_data_extraction',
          documentName: 'Data Extraction',
          documentText: combinedText,
          prompt: GEMINI_SYSTEM_PROMPT
        }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }
        return res.json();
      }).then(data => data.summary || '{}');

      let extractedData;
      try {
        // Clean the response text from any markdown formatting or Python-style syntax
        const cleanedResponse = this.cleanAIResponse(aiResponse);
        extractedData = JSON.parse(cleanedResponse);
      } catch (error) {
        console.error('Error parsing AI response as JSON:', error);
        console.error('Original AI response:', aiResponse);
        
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // Clean the extracted JSON
            const cleanedJson = this.cleanAIResponse(jsonMatch[0]);
            extractedData = JSON.parse(cleanedJson);
          } catch (innerError) {
            console.error('Error parsing extracted JSON:', innerError);
            
            // As a fallback, create a basic structure with default values
            extractedData = {
              fullName: '',
              fieldOfExpertise: '',
              yearsExperience: '',
              primaryDegree: {
                name: '',
                university: '',
                country: '',
                graduationYear: '',
                equivalent: 'Bachelor of Science',
                field: ''
              },
              additionalDegree: null,
              workExperience: []
            };
          }
        } else {
          // If no JSON-like structure is found, create a default structure
          extractedData = {
            fullName: '',
            fieldOfExpertise: '',
            yearsExperience: '',
            primaryDegree: {
              name: '',
              university: '',
              country: '',
              graduationYear: '',
              equivalent: 'Bachelor of Science',
              field: ''
            },
            additionalDegree: null,
            workExperience: []
          };
        }
      }

      // Sanitize the extracted data to ensure we don't use fallback values
      const sanitizedData = this.sanitizeExtractedData(extractedData);
      
      // Update the evaluation letter with the sanitized data
      const updateData: Partial<EvaluationLetterData> = {
        client_name: sanitizedData.fullName,
        university: sanitizedData.primaryDegree.university,
        country: sanitizedData.primaryDegree.country,
        bachelor_degree: sanitizedData.primaryDegree.name,
        degree_date1: sanitizedData.primaryDegree.graduationYear,
        us_equivalent_degree1: sanitizedData.primaryDegree.equivalent,
        field_of_study: sanitizedData.primaryDegree.field,
        additional_degree: !!sanitizedData.additionalDegree,
        university2: sanitizedData.additionalDegree?.university || '',
        degree_date2: sanitizedData.additionalDegree?.graduationYear || '',
        us_equivalent_degree2: sanitizedData.additionalDegree?.equivalent || '',
        field_of_study2: sanitizedData.additionalDegree?.field || '',
        specialty: sanitizedData.fieldOfExpertise,
        years: sanitizedData.yearsExperience,
        work_experience_summary: sanitizedData.workExperience,
        ai_summary: sanitizedData,
        extracted_text: { combinedText }
      };

      const { data: updatedLetter, error: updateError } = await supabase
        .from('evaluation_letters')
        .update(updateData)
        .eq('id', evaluationLetterId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating evaluation letter with AI data:', updateError);
        throw updateError;
      }

      return {
        extractedData,
        updatedLetter
      };
    } catch (error) {
      console.error('Error in extractDataWithAI:', error);
      throw error;
    }
  }

  /**
   * Generate a DOCX evaluation letter from the template
   */
  async generateEvaluationLetter(evaluationLetterId: string) {
    try {
      // Get the evaluation letter data
      const { data: letter, error } = await supabase
        .from('evaluation_letters')
        .select('*')
        .eq('id', evaluationLetterId)
        .single();

      if (error) {
        console.error('Error fetching evaluation letter:', error);
        throw error;
      }

      // Fetch the template
      const templateResponse = await fetch('/templates/Evaluation_Letter_Template_With_Placeholders.docx');
      
      // If DOCX template doesn't exist, use the text template
      let templateContent;
      if (!templateResponse.ok) {
        const textTemplateResponse = await fetch('/templates/Evaluation_Letter_Template_With_Placeholders.txt');
        if (!textTemplateResponse.ok) {
          throw new Error('Template file not found');
        }
        
        // Use text template as fallback
        const textTemplate = await textTemplateResponse.text();
        
        // Replace placeholders with actual values
        templateContent = this.replaceTextTemplatePlaceholders(textTemplate, letter);
        
        // Return as text
        return {
          content: templateContent,
          format: 'text'
        };
      }
      
      // Process DOCX template
      const templateBuffer = await templateResponse.arrayBuffer();
      const zip = new PizZip(templateBuffer);
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });
      
      // Set template data
      const templateData = {
        CURRENT_DATE: format(new Date(), 'MMMM d, yyyy'),
        CLIENTNAME: letter.client_name,
        UNIVERSITY: letter.university,
        COUNTRY: letter.country,
        BACHELOR_DEGREE: letter.bachelor_degree,
        DEGREE_DATE1: letter.degree_date1,
        US_EQUIVALENT_DEGREE1: letter.us_equivalent_degree1 || 'Bachelor of Science',
        ADDITIONAL_DEGREE: letter.additional_degree ? {
          ADDITIONAL_DEGREE: letter.additional_degree,
          UNIVERSITY2: letter.university2,
          DEGREE_DATE2: letter.degree_date2,
          US_EQUIVALENT_DEGREE2: letter.us_equivalent_degree2
        } : null,
        UNIVERSITY_LOCATION: letter.university_location || letter.country,
        FIELD_OF_STUDY: letter.field_of_study || letter.specialty,
        PROGRAM_LENGTH1: letter.program_length1 || '4 years',
        UNIVERSITY2_LOCATION: letter.university2_location,
        FIELD_OF_STUDY2: letter.field_of_study2,
        PROGRAM_LENGTH2: letter.program_length2,
        YEARS: letter.years,
        SPECIALTY: letter.specialty,
        WORK_EXPERIENCE_SUMMARY: letter.work_experience_summary || [],
        ACCREDITATION_BODY: letter.accreditation_body || 'Ministry of Education',
        DEGREE_LEVEL: letter.degree_level || 'undergraduate'
      };
      
      // Render the document
      doc.render(templateData);
      
      // Generate output
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Save the file
      const fileName = `Evaluation_Letter_${letter.client_name.replace(/\s+/g, '_')}.docx`;
      saveAs(output, fileName);
      
      return {
        fileName,
        format: 'docx'
      };
    } catch (error) {
      console.error('Error generating evaluation letter:', error);
      throw error;
    }
  }
  
  /**
   * Clean AI response to make it valid JSON
   * This removes code blocks, backticks, and converts Python-style syntax to JSON
   */
  private cleanAIResponse(text: string): string {
    if (!text) return '{}';
    
    // Remove markdown code block fences (```json and ```)
    let cleaned = text.replace(/```(?:json|javascript|js|python)?\s*([\s\S]*?)```/g, '$1');
    
    // Remove any remaining backticks
    cleaned = cleaned.replace(/`/g, '');
    
    // Convert Python None to null
    cleaned = cleaned.replace(/None/g, 'null');
    
    // Convert Python True/False to true/false
    cleaned = cleaned.replace(/True/g, 'true');
    cleaned = cleaned.replace(/False/g, 'false');
    
    // Convert Python-style single quotes to double quotes for keys
    cleaned = cleaned.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');
    
    // Convert Python-style single quotes to double quotes for string values
    cleaned = cleaned.replace(/:\s*'([^']+)'/g, ': "$1"');
    
    // Remove trailing commas in objects and arrays
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the text doesn't start with {, wrap it in {}
    if (!cleaned.startsWith('{')) {
      cleaned = '{' + cleaned + '}';
    }
    
    return cleaned;
  }

  /**
   * Sanitize extracted data to ensure we don't use fallback values
   * This ensures that only values explicitly found in the document are used
   */
  private sanitizeExtractedData(data: any) {
    return {
      fullName: data.fullName || '',
      fieldOfExpertise: data.fieldOfExpertise || '',
      yearsExperience: data.yearsExperience?.toString() || '',
      primaryDegree: {
        name: data.primaryDegree?.name || '',
        university: data.primaryDegree?.university || '',
        country: data.primaryDegree?.country || '',
        graduationYear: data.primaryDegree?.graduationYear?.toString() || '',
        equivalent: data.primaryDegree?.equivalent || '',
        field: data.primaryDegree?.field || ''
      },
      additionalDegree: data.additionalDegree ? {
        name: data.additionalDegree.name || '',
        university: data.additionalDegree.university || '',
        graduationYear: data.additionalDegree.graduationYear?.toString() || '',
        equivalent: data.additionalDegree.equivalent || '',
        field: data.additionalDegree.field || ''
      } : null,
      workExperience: Array.isArray(data.workExperience) ? data.workExperience : []
    };
  }

  /**
   * Replace placeholders in text template (fallback if DOCX template is not available)
   */
  private replaceTextTemplatePlaceholders(template: string, data: EvaluationLetterData) {
    let result = template;
    
    // Replace simple placeholders
    result = result.replace(/\{\{CURRENT_DATE\}\}/g, format(new Date(), 'MMMM d, yyyy'));
    result = result.replace(/\{\{CLIENTNAME\}\}/g, data.client_name || '');
    result = result.replace(/\{\{UNIVERSITY\}\}/g, data.university || '');
    result = result.replace(/\{\{COUNTRY\}\}/g, data.country || '');
    result = result.replace(/\{\{BACHELOR_DEGREE\}\}/g, data.bachelor_degree || '');
    result = result.replace(/\{\{DEGREE_DATE1\}\}/g, data.degree_date1 || '');
    result = result.replace(/\{\{US_EQUIVALENT_DEGREE1\}\}/g, data.us_equivalent_degree1 || 'Bachelor of Science');
    result = result.replace(/\{\{UNIVERSITY_LOCATION\}\}/g, data.university_location || data.country || '');
    result = result.replace(/\{\{FIELD_OF_STUDY\}\}/g, data.field_of_study || data.specialty || '');
    result = result.replace(/\{\{PROGRAM_LENGTH1\}\}/g, data.program_length1 || '4 years');
    result = result.replace(/\{\{YEARS\}\}/g, data.years || '');
    result = result.replace(/\{\{SPECIALTY\}\}/g, data.specialty || '');
    result = result.replace(/\{\{ACCREDITATION_BODY\}\}/g, data.accreditation_body || 'Ministry of Education');
    result = result.replace(/\{\{DEGREE_LEVEL\}\}/g, data.degree_level || 'undergraduate');
    
    // Handle conditional section for additional degree
    if (data.additional_degree) {
      // Replace placeholders in the additional degree section
      let additionalDegreeSection = result.match(/\{\{#ADDITIONAL_DEGREE\}\}([\s\S]*?)\{\{\/ADDITIONAL_DEGREE\}\}/)?.[1] || '';
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{ADDITIONAL_DEGREE\}\}/g, data.additional_degree.toString());
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{UNIVERSITY2\}\}/g, data.university2 || '');
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{DEGREE_DATE2\}\}/g, data.degree_date2 || '');
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{US_EQUIVALENT_DEGREE2\}\}/g, data.us_equivalent_degree2 || '');
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{UNIVERSITY2_LOCATION\}\}/g, data.university2_location || '');
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{FIELD_OF_STUDY2\}\}/g, data.field_of_study2 || '');
      additionalDegreeSection = additionalDegreeSection.replace(/\{\{PROGRAM_LENGTH2\}\}/g, data.program_length2 || '');
      
      // Replace the entire conditional section with the processed content
      result = result.replace(/\{\{#ADDITIONAL_DEGREE\}\}[\s\S]*?\{\{\/ADDITIONAL_DEGREE\}\}/g, additionalDegreeSection);
    } else {
      // Remove the additional degree section
      result = result.replace(/\{\{#ADDITIONAL_DEGREE\}\}[\s\S]*?\{\{\/ADDITIONAL_DEGREE\}\}/g, '');
    }
    
    // Handle work experience summary
    let workExperienceSummary = '';
    if (data.work_experience_summary && data.work_experience_summary.length > 0) {
      workExperienceSummary = data.work_experience_summary.map(item => `• ${item}`).join('\n');
    }
    
    // Replace the work experience summary section
    result = result.replace(/\{\{#WORK_EXPERIENCE_SUMMARY\}\}[\s\S]*?\{\{\/WORK_EXPERIENCE_SUMMARY\}\}/g, workExperienceSummary);
    
    return result;
  }
}

export const evaluationLetterService = new EvaluationLetterService();
