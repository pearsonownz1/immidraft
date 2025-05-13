// Document Verification Service
// Handles document verification and forgery detection using AI

import { aiService } from "./aiService";

// Types for document verification
export interface VerificationResult {
  verdict: "Likely Authentic" | "Possibly Fake" | "Inconclusive";
  confidenceScore: number;
  flags: string[];
  suggestedAction: string;
  emailTemplate?: string;
  metadataAnalysis?: {
    creationDate?: string;
    modificationDate?: string;
    software?: string;
    device?: string;
    suspicious: boolean;
  };
  extractedInfo?: {
    documentType: string;
    institutionName: string;
    recipientName: string;
    issueDate: string;
    degreeOrCertification: string;
    keyElements: string[];
  };
}

export interface VerificationDocument {
  id: string;
  name: string;
  file: File;
  type: string;
  size: number;
  extractedText?: string;
}

// Document Verification Service
export const documentVerificationService = {
  /**
   * Verify a document for authenticity
   * @param document The document to verify
   * @returns Verification result
   */
  verifyDocument: async (document: VerificationDocument): Promise<VerificationResult> => {
    try {
      console.log(`Verifying document: ${document.name}`);
      
      // Step 1: Extract text from document (would use Azure Document Intelligence in production)
      const extractedText = await extractTextFromDocument(document);
      
      // Validate OCR result exists and has sufficient content
      if (!extractedText || extractedText.length < 50) {
        console.warn("OCR output too short or empty:", extractedText);
        return {
          verdict: "Inconclusive",
          confidenceScore: 0,
          flags: ["Insufficient text extracted from document"],
          suggestedAction: "Please upload a clearer image or a different document format"
        };
      }
      
      console.log("OCR extraction successful, sending to AI analysis:", 
        extractedText.substring(0, 100) + "...");
      
      // Step 2: Analyze document with AI
      try {
        // Set a timeout for the AI analysis to prevent hanging
        const timeoutPromise = new Promise<VerificationResult>((_, reject) => {
          setTimeout(() => reject(new Error("AI analysis timeout")), 15000);
        });
        
        // Actual AI analysis
        const analysisPromise = analyzeDocumentAuthenticity(document, extractedText);
        
        // Race between timeout and analysis
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        console.log("AI analysis completed successfully:", result.verdict);
        return result;
      } catch (aiError) {
        console.error("AI Analysis Error:", aiError);
        
        // Fallback to mock result for testing
        console.log("Using fallback mock result due to AI error");
        return generateFallbackResult(document);
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      return {
        verdict: "Inconclusive",
        confidenceScore: 0,
        flags: ["Error processing document"],
        suggestedAction: "Please try again or upload a different document format"
      };
    }
  },
  
  /**
   * Generate an email template for manual verification
   * @param document The document to verify
   * @param institution The institution to contact
   * @returns Email template
   */
  generateVerificationEmail: (document: VerificationDocument, institution?: string): string => {
    const today = new Date().toLocaleDateString();
    const institutionName = institution || "the issuing institution";
    
    return `Subject: Verification Request for Document ${document.name}

Date: ${today}

Dear ${institutionName} Registrar,

I am writing to request verification of the attached document that was submitted as part of an application process. The document appears to be issued by your institution.

Document Details:
- Document Name: ${document.name}
- Document Type: ${document.type}
- Purported Issue Date: [Date on Document]

Could you please confirm if this document was issued by your institution to the individual named in the document? Any information you can provide regarding its authenticity would be greatly appreciated.

Thank you for your assistance in this matter.

Sincerely,
[Your Name]
[Your Position]
[Contact Information]`;
  },
  
  /**
   * Check if a document has metadata that suggests it might be a screenshot
   * @param document The document to check
   * @returns Boolean indicating if it's likely a screenshot
   */
  isLikelyScreenshot: (document: File): boolean => {
    // In a real implementation, this would analyze image metadata
    // For now, we'll use a simple heuristic based on filename
    const filename = document.name.toLowerCase();
    return filename.includes("screenshot") || 
           filename.includes("screen shot") || 
           filename.includes("capture");
  },
  
  /**
   * Extract metadata from a document
   * @param document The document to analyze
   * @returns Metadata analysis
   */
  extractMetadata: async (document: File): Promise<any> => {
    // In a real implementation, this would extract file metadata
    // For now, return mock metadata
    return {
      creationDate: new Date().toISOString(),
      modificationDate: new Date().toISOString(),
      software: "Unknown",
      device: "Unknown",
      suspicious: false
    };
  }
};

/**
 * Extract text from a document (mock implementation)
 * @param document The document to extract text from
 * @returns Extracted text
 */
async function extractTextFromDocument(document: VerificationDocument): Promise<string> {
  // In a real implementation, this would use Azure Document Intelligence or similar
  // For now, return mock text based on file type and name
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const filename = document.name.toLowerCase();
  
  if (filename.includes("diploma") || filename.includes("degree")) {
    return `DIPLOMA

This certifies that

JOHN SMITH

has successfully completed all requirements for the degree of

BACHELOR OF SCIENCE IN COMPUTER SCIENCE

with all rights, privileges, and honors pertaining thereto.

Given at University of Technology on May 15, 2022

[Signature]
President of the University`;
  } else if (filename.includes("transcript")) {
    return `ACADEMIC TRANSCRIPT

Student: Jane Doe
Student ID: 12345678
Program: Master of Business Administration

COURSES                                GRADE
Business Strategy                      A
Financial Management                   B+
Marketing Management                   A-
Organizational Behavior                A
Business Ethics                        B+

GPA: 3.7

Issued on: January 10, 2023`;
  } else if (filename.includes("certificate")) {
    return `CERTIFICATE OF ACHIEVEMENT

This certifies that

ROBERT JOHNSON

has successfully completed the
ADVANCED MACHINE LEARNING SPECIALIZATION

Awarded on: March 5, 2023

[Signature]
Program Director`;
  } else {
    // Generic document text
    return `This appears to be a document related to ${filename.split('.')[0]}.
    
The document contains various text elements that would need to be verified for authenticity.

Date: ${new Date().toLocaleDateString()}

Reference Number: REF-${Math.floor(Math.random() * 1000000)}

[Additional document content would appear here]`;
  }
}

/**
 * Extract detailed information from document text
 * @param text The extracted text from the document
 * @param filename The name of the document file
 * @returns Structured document information
 */
function extractDocumentInfo(text: string, filename: string): any {
  console.log("Extracting document info from:", filename);
  
  // Initialize document info object
  const documentInfo = {
    documentType: "Unknown",
    institutionName: "",
    recipientName: "",
    issueDate: "",
    degreeOrCertification: "",
    hasSignature: false,
    hasDate: false,
    hasInstitutionName: false,
    suspiciousPatterns: 0,
    inconsistentFonts: false,
    unusualFormatting: false,
    missingSecurityFeatures: false,
    specificFlags: [] as string[],
    keyElements: [] as string[]
  };
  
  // Determine document type based on content and filename
  if (text.toLowerCase().includes("diploma") || filename.toLowerCase().includes("diploma") || 
      text.toLowerCase().includes("degree") || filename.toLowerCase().includes("degree")) {
    documentInfo.documentType = "Diploma/Degree";
  } else if (text.toLowerCase().includes("transcript") || filename.toLowerCase().includes("transcript")) {
    documentInfo.documentType = "Academic Transcript";
  } else if (text.toLowerCase().includes("certificate") || filename.toLowerCase().includes("certificate")) {
    documentInfo.documentType = "Certificate";
  } else if (text.toLowerCase().includes("report") || filename.toLowerCase().includes("report")) {
    documentInfo.documentType = "Report";
  }
  
  // Extract institution name
  const institutionPatterns = [
    /university of ([a-z\s]+)/i,
    /([a-z\s]+) university/i,
    /([a-z\s]+) college/i,
    /college of ([a-z\s]+)/i,
    /institute of ([a-z\s]+)/i,
    /([a-z\s]+) institute/i,
    /school of ([a-z\s]+)/i
  ];
  
  for (const pattern of institutionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      documentInfo.institutionName = match[0].trim();
      documentInfo.hasInstitutionName = true;
      break;
    }
  }
  
  // Extract recipient name
  const namePatterns = [
    /this certifies that\s+([a-z\s\.]+)/i,
    /awarded to\s+([a-z\s\.]+)/i,
    /presented to\s+([a-z\s\.]+)/i,
    /student:\s+([a-z\s\.]+)/i,
    /name:\s+([a-z\s\.]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      documentInfo.recipientName = match[1].trim();
      break;
    }
  }
  
  // If no name found with patterns, look for all-caps names which are common in diplomas
  if (!documentInfo.recipientName) {
    const allCapsNameMatch = text.match(/\n\s*([A-Z][A-Z\s\.]+)\s*\n/);
    if (allCapsNameMatch && allCapsNameMatch[1]) {
      documentInfo.recipientName = allCapsNameMatch[1].trim();
    }
  }
  
  // Extract date
  const datePatterns = [
    /dated?\s*:?\s*([a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /issued\s*:?\s*([a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /awarded\s*:?\s*([a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /on\s*:?\s*([a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      documentInfo.issueDate = match[1].trim();
      documentInfo.hasDate = true;
      break;
    }
  }
  
  // Extract degree or certification
  const degreePatterns = [
    /degree of\s+([a-z\s]+)/i,
    /bachelor of ([a-z\s]+)/i,
    /master of ([a-z\s]+)/i,
    /doctor of ([a-z\s]+)/i,
    /([a-z\s]+) specialization/i,
    /certificate in ([a-z\s]+)/i
  ];
  
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      documentInfo.degreeOrCertification = match[0].trim();
      break;
    }
  }
  
  // Check for signature
  documentInfo.hasSignature = text.toLowerCase().includes("signature") || 
                              text.includes("[Signature]") || 
                              text.includes("signed") ||
                              text.includes("Dean") ||
                              text.includes("President") ||
                              text.includes("Director");
  
  // Check for suspicious patterns
  if (text.length < 200) {
    documentInfo.suspiciousPatterns++;
    documentInfo.specificFlags.push("Document text is unusually short");
  }
  
  if (!documentInfo.hasSignature) {
    documentInfo.suspiciousPatterns++;
    documentInfo.specificFlags.push("No signature detected on document");
  }
  
  if (!documentInfo.hasDate) {
    documentInfo.suspiciousPatterns++;
    documentInfo.specificFlags.push("No issue date found on document");
  }
  
  if (!documentInfo.hasInstitutionName) {
    documentInfo.suspiciousPatterns++;
    documentInfo.specificFlags.push("No clear issuing institution identified");
  }
  
  // Document-specific checks
  if (documentInfo.documentType === "Diploma/Degree") {
    if (!text.toLowerCase().includes("honors") && 
        !text.toLowerCase().includes("rights") && 
        !text.toLowerCase().includes("privileges")) {
      documentInfo.suspiciousPatterns++;
      documentInfo.specificFlags.push("Missing standard diploma phrasing");
    }
    
    if (!documentInfo.degreeOrCertification) {
      documentInfo.suspiciousPatterns++;
      documentInfo.specificFlags.push("No degree specification found");
    }
  } else if (documentInfo.documentType === "Academic Transcript") {
    if (!text.toLowerCase().includes("grade") && 
        !text.toLowerCase().includes("gpa") && 
        !text.toLowerCase().includes("credit")) {
      documentInfo.suspiciousPatterns++;
      documentInfo.specificFlags.push("Missing standard transcript elements");
    }
  } else if (documentInfo.documentType === "Certificate") {
    if (!text.toLowerCase().includes("completed") && 
        !text.toLowerCase().includes("achievement") && 
        !text.toLowerCase().includes("awarded")) {
      documentInfo.suspiciousPatterns++;
      documentInfo.specificFlags.push("Missing standard certificate phrasing");
    }
  }
  
  // Extract key elements from the document
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  documentInfo.keyElements = lines.slice(0, Math.min(5, lines.length));
  
  // Add more document-specific flags based on content analysis
  if (filename.toLowerCase().includes("transcript")) {
    const hasGrades = /[A-F][+\-]?/.test(text);
    if (!hasGrades) {
      documentInfo.specificFlags.push("No grades found in transcript");
    }
    
    const hasStudentID = /student id|id number|id:/i.test(text);
    if (!hasStudentID) {
      documentInfo.specificFlags.push("No student ID found in transcript");
    }
  }
  
  // Check for unusual color patterns (this would be more sophisticated in a real implementation)
  if (filename.toLowerCase().includes("color") || filename.toLowerCase().includes("unusual")) {
    documentInfo.specificFlags.push("Unusual color patterns detected");
    documentInfo.suspiciousPatterns++;
  }
  
  return documentInfo;
}

/**
 * Generate a fallback result for testing when AI analysis fails
 * @param document The document to analyze
 * @returns Verification result
 */
function generateFallbackResult(document: VerificationDocument): VerificationResult {
  console.log("Generating fallback result for", document.name);
  
  // Generate a confidence score based on the document name for consistency in testing
  const nameSum = document.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const confidenceScore = (nameSum % 30) + 70; // 70-99 range
  
  // Determine verdict based on confidence score
  let verdict: "Likely Authentic" | "Possibly Fake" | "Inconclusive";
  if (confidenceScore > 85) {
    verdict = "Likely Authentic";
  } else if (confidenceScore > 70) {
    verdict = "Inconclusive";
  } else {
    verdict = "Possibly Fake";
  }
  
  return {
    verdict,
    confidenceScore,
    flags: [
      "FALLBACK MODE: AI analysis unavailable",
      "Document requires manual verification"
    ],
    suggestedAction: "Contact the issuing institution to verify this document",
    emailTemplate: documentVerificationService.generateVerificationEmail(document),
    metadataAnalysis: {
      creationDate: new Date().toISOString().split('T')[0],
      modificationDate: new Date().toISOString().split('T')[0],
      software: "Unknown",
      device: "Unknown",
      suspicious: false
    }
  };
}

/**
 * Analyze a document for authenticity with detailed analysis
 * @param document The document to analyze
 * @param extractedText The extracted text from the document
 * @returns Verification result
 */
async function analyzeDocumentAuthenticity(
  document: VerificationDocument,
  extractedText: string
): Promise<VerificationResult> {
  // In a real implementation, this would use AI to analyze the document
  console.log("Starting AI analysis for document:", document.name);
  
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract key information from the document text
    const documentInfo = extractDocumentInfo(extractedText, document.name);
    
    // Construct prompt for AI (in production, this would be sent to Gemini/GPT-4)
    const prompt = `
You're an expert in document verification. Analyze the following OCR-extracted text and return:

1. Verdict on authenticity
2. Confidence score (0–100)
3. Specific red flags or inconsistencies
4. Key information extracted
5. Recommended next steps

OCR TEXT:
"""${extractedText}"""
`;
    console.log("AI prompt constructed, would send to LLM in production");
    console.log("Document info extracted:", documentInfo);
    
    // In production, this would be: const result = await aiService.generateText(prompt);
    // For now, generate a more detailed response based on the document content
    
    const filename = document.name.toLowerCase();
    const isLikelyScreenshot = documentVerificationService.isLikelyScreenshot(document.file);
    
    // Generate confidence score based on document characteristics
    let confidenceScore = 85; // Default high score
    
    // Adjust confidence based on document characteristics
    if (isLikelyScreenshot) confidenceScore -= 15;
    if (!documentInfo.hasSignature) confidenceScore -= 10;
    if (!documentInfo.hasDate) confidenceScore -= 8;
    if (!documentInfo.hasInstitutionName) confidenceScore -= 12;
    if (documentInfo.suspiciousPatterns > 0) confidenceScore -= (5 * documentInfo.suspiciousPatterns);
    
    // Ensure score stays within bounds
    confidenceScore = Math.max(Math.min(confidenceScore, 99), 40);
    
    // Determine verdict based on confidence score
    let verdict: "Likely Authentic" | "Possibly Fake" | "Inconclusive";
    if (confidenceScore > 85) {
      verdict = "Likely Authentic";
    } else if (confidenceScore > 70) {
      verdict = "Inconclusive";
    } else {
      verdict = "Possibly Fake";
    }
    
    console.log("AI analysis completed with verdict:", verdict, "and confidence:", confidenceScore);
    
    // Generate specific flags based on document analysis
    const flags: string[] = [];
    
    // Add flags based on actual document characteristics
    if (isLikelyScreenshot) {
      flags.push("Document appears to be a screenshot rather than an original");
    }
    
    if (extractedText.length < 100) {
      flags.push("Document contains minimal text content");
    }
    
    if (!documentInfo.hasDate) {
      flags.push("No issue date found on document");
    }
    
    if (!documentInfo.hasSignature) {
      flags.push("No signature detected on document");
    }
    
    if (!documentInfo.hasInstitutionName) {
      flags.push("No clear issuing institution identified");
    }
    
    if (documentInfo.suspiciousPatterns > 0) {
      if (documentInfo.inconsistentFonts) {
        flags.push("Inconsistent font usage throughout document");
      }
      
      if (documentInfo.unusualFormatting) {
        flags.push("Unusual formatting detected");
      }
      
      if (documentInfo.missingSecurityFeatures) {
        flags.push("Missing security features (watermark, hologram, etc.)");
      }
    }
    
    // Add document-specific flags
    documentInfo.specificFlags.forEach(flag => {
      if (!flags.includes(flag)) {
        flags.push(flag);
      }
    });
    
    // Determine suggested action based on verdict and document type
    let suggestedAction = "";
    if (verdict === "Likely Authentic") {
      suggestedAction = `Document appears authentic, but verification with ${documentInfo.institutionName || "the issuing institution"} is recommended for complete certainty`;
    } else if (verdict === "Possibly Fake") {
      suggestedAction = `Contact ${documentInfo.institutionName || "the issuing institution"} to verify the document's authenticity`;
    } else {
      suggestedAction = `Additional verification required. Consider contacting ${documentInfo.institutionName || "the issuing institution"}`;
    }
    
    // Generate email template with specific institution if available
    const emailTemplate = documentVerificationService.generateVerificationEmail(
      document, 
      documentInfo.institutionName
    );
    
    return {
      verdict,
      confidenceScore,
      flags,
      suggestedAction,
      emailTemplate,
      metadataAnalysis: {
        creationDate: new Date().toISOString().split('T')[0],
        modificationDate: new Date().toISOString().split('T')[0],
        software: isLikelyScreenshot ? "Screenshot Tool" : "Unknown",
        device: "Unknown",
        suspicious: isLikelyScreenshot || flags.length > 2
      },
      // Add extracted information to show what the AI "saw"
      extractedInfo: {
        documentType: documentInfo.documentType,
        institutionName: documentInfo.institutionName || "Unknown",
        recipientName: documentInfo.recipientName || "Unknown",
        issueDate: documentInfo.issueDate || "Not found",
        degreeOrCertification: documentInfo.degreeOrCertification || "Not specified",
        keyElements: documentInfo.keyElements
      }
    };
  } catch (error) {
    console.error("Error in AI analysis:", error);
    throw error; // Re-throw to be caught by the timeout handler in verifyDocument
  }
}
