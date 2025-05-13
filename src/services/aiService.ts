// AI Service for document analysis, tagging, and letter drafting
// Now using Google Gemini via API endpoint instead of direct OpenAI integration
import { sampleLetterService } from "./sampleLetterService";
import { letterPromptService } from "./letterPromptService";

// Types for AI service responses
export interface AIDocumentAnalysis {
  tags: string[];
  criteria: string[];
  confidence: number;
  summary?: string;
}

export interface AIDocumentSummary {
  summary: string;
  tags: string[];
  documentType: string;
}

export interface AILetterDraft {
  content: string;
  citations: Array<{
    id: string;
    text: string;
    documentId: string;
  }>;
}

export interface AICriteriaAnalysis {
  criterionId: string;
  coverage: number; // 0-100
  documentIds: string[];
  suggestions: string[];
}

// API endpoint for AI processing
const API_ENDPOINT = '/api/process-document';

// AI service functions with real OpenAI integration
export const aiService = {
  /**
   * Analyzes a document and suggests tags and relevant criteria
   */
  analyzeDocument: async (
    document: File | { name: string; type: string; size: number },
  ): Promise<AIDocumentAnalysis> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response based on document name/type
    const fileName = document.name.toLowerCase();

    // Default analysis
    const analysis: AIDocumentAnalysis = {
      tags: [],
      criteria: [],
      confidence: 0.8,
    };

    // Add tags based on filename
    if (fileName.includes("resume") || fileName.includes("cv")) {
      analysis.tags = ["Resume", "Professional", "Background"];
      analysis.criteria = ["Work Experience", "Education"];
      analysis.summary =
        "Professional resume detailing work history and education.";
    } else if (
      fileName.includes("recommendation") ||
      fileName.includes("letter")
    ) {
      analysis.tags = ["Letter", "Reference", "Recommendation"];
      analysis.criteria = ["Recommendation", "Professional Recognition"];
      analysis.summary =
        "Letter of recommendation from a professional contact.";
    } else if (
      fileName.includes("publication") ||
      fileName.includes("article")
    ) {
      analysis.tags = ["Publication", "Academic", "Research"];
      analysis.criteria = ["Scholarly Articles", "Original Contributions"];
      analysis.summary = "Published academic or research work.";
    } else if (fileName.includes("award") || fileName.includes("certificate")) {
      analysis.tags = ["Award", "Certificate", "Recognition"];
      analysis.criteria = ["Awards", "National Recognition"];
      analysis.summary =
        "Award or certificate demonstrating recognition in the field.";
    } else {
      // Generic tags for other documents
      analysis.tags = ["Document", "Evidence"];
      analysis.criteria = [];
    }

    return analysis;
  },

  /**
   * Analyzes coverage of criteria based on uploaded documents
   */
  analyzeCriteriaCoverage: async (
    criterionId: string,
    documentIds: string[],
  ): Promise<AICriteriaAnalysis> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response
    return {
      criterionId,
      coverage: documentIds.length > 2 ? 85 : documentIds.length > 0 ? 40 : 0,
      documentIds,
      suggestions:
        documentIds.length === 0
          ? [
              "Upload documents related to this criterion",
              "Consider obtaining letters of recommendation",
            ]
          : documentIds.length < 3
            ? [
                "Additional supporting evidence recommended",
                "Consider more diverse evidence types",
              ]
            : [
                "Evidence appears sufficient",
                "Consider organizing documents by relevance",
              ],
    };
  },

  /**
   * Drafts an expert opinion letter based on provided documents and criteria using Google Gemini
   */
  draftExpertLetter: async (
    visaType: string,
    beneficiaryInfo: any,
    expertInfo: any,
    documents: any[],
  ): Promise<AILetterDraft> => {
    try {
      console.log('Calling API to draft expert letter');
      
      // Get document tags to help find the best sample letter
      const documentTags = documents.flatMap(doc => doc.tags || []);
      
      // Create evidence object for the prompt service
      const evidence = {
        applicant: {
          name: beneficiaryInfo.name || '[Beneficiary Name]',
          field: beneficiaryInfo.field || '[Field of Expertise]',
          position: beneficiaryInfo.position || '[Current Position]'
        },
        expert: {
          name: expertInfo.name || '[Expert Name]',
          credentials: expertInfo.credentials || expertInfo.title || '[Expert Credentials]',
          position: expertInfo.position || '[Expert Position]',
          relationship: expertInfo.relationship || '[Relationship]'
        },
        achievements: documents
          .filter(doc => doc.description && doc.description.toLowerCase().includes('achievement'))
          .map(doc => doc.description),
        publications: documents
          .filter(doc => doc.title && (doc.title.toLowerCase().includes('publication') || doc.title.toLowerCase().includes('article')))
          .map(doc => doc.description || doc.title),
        awards: documents
          .filter(doc => doc.title && (doc.title.toLowerCase().includes('award') || doc.title.toLowerCase().includes('recognition')))
          .map(doc => doc.description || doc.title),
        other: documents
          .filter(doc => doc.description)
          .map(doc => `${doc.title || 'Document'}: ${doc.description}`)
          .join('\n')
      };
      
      // Generate the prompt using our letterPromptService
      const prompt = letterPromptService.generatePromptWithSample(visaType, documentTags, evidence);
      
      console.log('Generated prompt using letterPromptService');
      
      // Log the documents being sent to the API
      console.log('Documents being sent to API:', documents);
      
      // Log the request details for debugging
      console.log('Sending request to API endpoint:', API_ENDPOINT);
      console.log('Request payload:', {
        documentType: 'expert_letter',
        documentName: `${visaType} Expert Letter for ${beneficiaryInfo.name || 'Beneficiary'}`,
        prompt: prompt.substring(0, 100) + '...' // Log just the beginning of the prompt
      });
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'expert_letter',
          documentName: `${visaType} Expert Letter for ${beneficiaryInfo.name || 'Beneficiary'}`,
          documentText: prompt, // Use documentText instead of prompt to satisfy the API requirement
          prompt
        }),
      });
      
      // Log the response status for debugging
      console.log('API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        // Try to get more details from the error response
        let errorDetails = '';
        try {
          const errorJson = await response.json();
          errorDetails = JSON.stringify(errorJson);
        } catch (e) {
          errorDetails = await response.text();
        }
        console.error('API error details:', errorDetails);
        throw new Error(`API error: ${response.statusText} (${response.status}) - ${errorDetails}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Check if we have a valid response with a summary field
      if (!data.summary && data.error) {
        console.error('API error:', data.error);
        throw new Error(`API error: ${data.error}`);
      }
      
      // The API returns the generated content in the summary field
      const generatedContent = data.summary || '';
      
      // If the generated content is empty, log a warning
      if (!generatedContent) {
        console.warn('Generated content is empty. API response:', data);
      }
      
      // Create citations based on the documents
      const citations = documents.map((doc, index) => ({
        id: (index + 1).toString(),
        text: `Reference to ${doc.title || `Document ${index + 1}`}`,
        documentId: doc.id || (index + 1).toString()
      }));
      
      return {
        content: generatedContent,
        citations
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback to mock response if API call fails
      return {
        content: `[Expert Letterhead]\n\nDate: ${new Date().toLocaleDateString()}\n\nRe: Expert Opinion Letter for ${beneficiaryInfo.name || "the beneficiary"}'s ${visaType} Petition\n\nTo Whom It May Concern:\n\nI am writing this letter as an expert in the field of [Expert's Field] to provide my professional opinion regarding the extraordinary ability of ${beneficiaryInfo.name || "the beneficiary"} in the field of [Beneficiary's Field].\n\nBased on my review of the provided documentation and my expertise in this field, I can confidently state that ${beneficiaryInfo.name || "the beneficiary"} meets the criteria for classification as an individual of extraordinary ability under the ${visaType} category.\n\n[AI would generate specific content based on documents and criteria here]\n\nIn conclusion, based on my expert evaluation of the evidence provided, it is my professional opinion that ${beneficiaryInfo.name || "the beneficiary"} clearly qualifies as an individual with extraordinary ability in [field] for the purposes of the ${visaType} visa classification.\n\nSincerely,\n\n[Expert Name]\n[Expert Qualifications]\n[Contact Information]`,
        citations: [
          {
            id: "1",
            text: "Reference to Document 1",
            documentId: documents.length > 0 ? documents[0].id : "1",
          },
          {
            id: "2",
            text: "Reference to Document 2",
            documentId: documents.length > 1 ? documents[1].id : "2",
          },
        ],
      };
    }
  },

  /**
   * Drafts a petition letter based on provided documents and criteria
   */
  draftPetitionLetter: async (
    visaType: string,
    beneficiaryInfo: any,
    petitionerInfo: any,
    documents: any[],
  ): Promise<AILetterDraft> => {
    try {
      console.log('Calling API to draft petition letter');
      
      // Get document tags to help find the best sample letter
      const documentTags = documents.flatMap(doc => doc.tags || []);
      
      // Create evidence object for the prompt service
      const evidence = {
        applicant: {
          name: beneficiaryInfo.name || '[Beneficiary Name]',
          field: beneficiaryInfo.field || '[Field of Expertise]',
          position: beneficiaryInfo.position || '[Current Position]'
        },
        petitioner: {
          name: petitionerInfo.name || '[Petitioner Name]',
          relationship: petitionerInfo.relationship || '[Relationship to Beneficiary]'
        },
        achievements: documents
          .filter(doc => doc.description && doc.description.toLowerCase().includes('achievement'))
          .map(doc => doc.description),
        publications: documents
          .filter(doc => doc.title && (doc.title.toLowerCase().includes('publication') || doc.title.toLowerCase().includes('article')))
          .map(doc => doc.description || doc.title),
        awards: documents
          .filter(doc => doc.title && (doc.title.toLowerCase().includes('award') || doc.title.toLowerCase().includes('recognition')))
          .map(doc => doc.description || doc.title),
        other: documents
          .filter(doc => doc.description)
          .map(doc => `${doc.title || 'Document'}: ${doc.description}`)
          .join('\n')
      };
      
      // Generate the prompt using our letterPromptService
      const prompt = letterPromptService.generatePromptWithSample(visaType, documentTags, evidence);
      
      console.log('Generated prompt using letterPromptService');
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'petition_letter',
          documentName: `${visaType} Petition Letter for ${beneficiaryInfo.name || 'Beneficiary'}`,
          documentText: prompt,
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // The API returns the generated content in the summary field
      const generatedContent = data.summary || '';
      
      // Create citations based on the documents
      const citations = documents.map((doc, index) => ({
        id: (index + 1).toString(),
        text: `Exhibit ${String.fromCharCode(65 + index)}: ${doc.title || `Document ${index + 1}`}`,
        documentId: doc.id || (index + 1).toString()
      }));
      
      return {
        content: generatedContent,
        citations
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback to mock response if API call fails
      return {
        content: `[Law Firm Letterhead]\n\nDate: ${new Date().toLocaleDateString()}\n\nU.S. Citizenship and Immigration Services\nP.O. Box [Address]\n[City, State ZIP]\n\nRe: Petition for ${visaType} Classification for ${beneficiaryInfo.name || "the beneficiary"}\n\nDear Sir or Madam:\n\nThis letter is submitted in support of the petition of ${petitionerInfo.name || "the petitioner"} seeking to classify ${beneficiaryInfo.name || "the beneficiary"} as ${visaType === "O-1A" ? "an alien of extraordinary ability" : visaType === "EB-1A" ? "an alien of extraordinary ability" : "a qualified professional"} pursuant to Section [relevant section] of the Immigration and Nationality Act.\n\n[AI would generate specific content based on documents and criteria here]\n\nBased on the evidence presented and the applicable legal standards, we respectfully submit that ${beneficiaryInfo.name || "the beneficiary"} qualifies for classification under the ${visaType} category. We appreciate your consideration of this petition and are available to provide any additional information that may be required.\n\nRespectfully submitted,\n\n[Attorney Name]\n[Law Firm]`,
        citations: [
          {
            id: "1",
            text: "Exhibit A: [Document Description]",
            documentId: documents.length > 0 ? documents[0].id : "1",
          },
          {
            id: "2",
            text: "Exhibit B: [Document Description]",
            documentId: documents.length > 1 ? documents[1].id : "2",
          },
        ],
      };
    }
  },

  /**
   * Refines existing letter content based on user feedback using Google Gemini
   */
  refineLetter: async (
    content: string,
    instructions: string,
  ): Promise<string> => {
    try {
      console.log('Calling API to refine letter');
      
      // Prepare the prompt for the API
      const prompt = `
        You are an expert immigration attorney specializing in drafting and refining expert opinion letters for visa petitions. 
        Your task is to improve the provided letter based on the user's instructions while maintaining a professional tone and legal accuracy.
        
        Please refine the following expert opinion letter based on these instructions: "${instructions}"
        
        LETTER CONTENT:
        ${content}
      `;
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'letter_refinement',
          documentName: 'Letter Refinement',
          documentText: prompt, // Use documentText instead of prompt to satisfy the API requirement
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.summary || content;
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback if API call fails
      return content + '\n\n[This content has been refined based on your instructions: "' + instructions + '"]';
    }
  },
  
  /**
   * Summarizes a document using Google Gemini
   */
  summarizeDocument: async (
    extractedText: string,
    fileName: string
  ): Promise<AIDocumentSummary> => {
    try {
      console.log('Calling API to summarize document:', fileName);
      
      // Prepare the prompt for the API
      const prompt = `
        You are a legal assistant preparing immigration evidence. Your task is to summarize documents and identify their type and relevance to immigration cases.
        
        Summarize the following document. Identify if it's a recommendation letter, award certificate, publication, or patent. Note any names, affiliations, dates, and achievements.
        
        Document name: ${fileName}
        
        Document content:
        ${extractedText.substring(0, 4000)}
        
        IMPORTANT: Return ONLY raw JSON without any markdown formatting, code blocks, or backticks.
        Your entire response should be valid JSON that can be directly parsed.
        
        Example of the expected format:
        {"summary":"your summary here","tags":["tag1","tag2","tag3"],"documentType":"document_type_here"}
      `;
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'document_summary',
          documentName: fileName,
          documentText: prompt, // Use documentText instead of prompt to satisfy the API requirement
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const summaryText = data.summary || '';
      
      // Try to parse the summary as JSON
      try {
        const parsedData = JSON.parse(summaryText);
        return {
          summary: parsedData.summary || summaryText,
          tags: Array.isArray(parsedData.tags) ? parsedData.tags : [parsedData.documentType || "document"],
          documentType: parsedData.documentType || "document"
        };
      } catch (parseError) {
        console.error('Error parsing summary JSON:', parseError);
        
        // Fallback to simple extraction
        let documentType = "document";
        if (summaryText.toLowerCase().includes("recommendation letter") || 
            summaryText.toLowerCase().includes("reference letter")) {
          documentType = "recommendation_letter";
        } else if (summaryText.toLowerCase().includes("patent")) {
          documentType = "patent";
        } else if (summaryText.toLowerCase().includes("award") || 
                  summaryText.toLowerCase().includes("certificate")) {
          documentType = "award";
        } else if (summaryText.toLowerCase().includes("publication") || 
                  summaryText.toLowerCase().includes("article") ||
                  summaryText.toLowerCase().includes("paper")) {
          documentType = "publication";
        }
        
        return {
          summary: summaryText,
          tags: [documentType],
          documentType
        };
      }
    } catch (error) {
      console.error('Error calling AI service for document summarization:', error);
      
      // Fallback if API call fails
      return {
        summary: `This appears to be a document related to immigration evidence. The document name is ${fileName}.`,
        tags: ["document"],
        documentType: "document"
      };
    }
  },
  
  /**
   * Improves a specific paragraph in the letter using Google Gemini
   */
  improveParagraph: async (
    content: string,
    paragraph: string,
    instructions: string = "Make this paragraph more persuasive and detailed"
  ): Promise<string> => {
    try {
      console.log('Calling API to improve paragraph');
      
      // Prepare the prompt for the API
      const prompt = `
        You are an expert immigration attorney specializing in drafting persuasive expert opinion letters for visa petitions. 
        Your task is to improve a specific paragraph from a letter while maintaining the overall flow and context.
        
        Please improve the following paragraph based on these instructions: "${instructions}"
        
        PARAGRAPH TO IMPROVE:
        ${paragraph}
        
        FULL LETTER CONTEXT (for reference):
        ${content}
      `;
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'paragraph_improvement',
          documentName: 'Paragraph Improvement',
          documentText: prompt, // Use documentText instead of prompt to satisfy the API requirement
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.summary || paragraph;
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback if API call fails
      return paragraph + '\n\n[This paragraph would be improved based on your instructions: "' + instructions + '"]';
    }
  },
  
  /**
   * Generates a citation for a specific exhibit to insert into the letter using Google Gemini
   */
  generateCitation: async (
    exhibit: any,
    letterContext: string
  ): Promise<string> => {
    try {
      console.log('Calling API to generate citation');
      
      // Prepare the prompt for the API
      const prompt = `
        You are an expert immigration attorney specializing in drafting expert opinion letters for visa petitions. 
        Your task is to generate a professional citation for an exhibit that can be inserted into an expert letter.
        
        Please generate a professional citation for the following exhibit that can be inserted into an expert letter:
        
        EXHIBIT DETAILS:
        Title: ${exhibit.title || 'Untitled'}
        Description: ${exhibit.description || 'No description provided'}
        Type: ${exhibit.type || 'Document'}
        
        LETTER CONTEXT (for reference):
        ${letterContext}
      `;
      
      // Call API endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'citation_generation',
          documentName: 'Citation Generation',
          documentText: prompt, // Use documentText instead of prompt to satisfy the API requirement
          prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.summary || `As evidenced by ${exhibit.title || 'the provided document'}, the beneficiary has demonstrated extraordinary ability in the field.`;
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback if API call fails
      return `As evidenced by ${exhibit.title || 'the provided document'}, the beneficiary has demonstrated extraordinary ability in the field.`;
    }
  }
};
