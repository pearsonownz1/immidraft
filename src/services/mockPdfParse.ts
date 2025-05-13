/**
 * Mock implementation of pdf-parse for browser environments
 * This avoids the "Fs.readFileSync is not a function" error
 */

interface PdfParseResult {
  text: string;
  numpages: number;
  info: Record<string, any>;
}

// Store the document type from the last call to extractText
// This is a workaround since we can't pass the document type directly to mockPdfParse
let lastDocumentType = '';
let lastDocumentName = '';

export const setLastDocumentInfo = (type: string, name: string) => {
  lastDocumentType = type.toLowerCase();
  lastDocumentName = name.toLowerCase();
  console.log(`Set last document info: type=${lastDocumentType}, name=${lastDocumentName}`);
};

/**
 * Mock implementation of pdf-parse
 * @param dataBuffer PDF data as Buffer or Uint8Array
 * @returns Promise resolving to a mock PDF parse result
 */
const mockPdfParse = async (dataBuffer: Buffer | Uint8Array): Promise<PdfParseResult> => {
  console.log('Using intelligent mock PDF parser for browser environment');
  console.log(`Document type: ${lastDocumentType}, name: ${lastDocumentName}`);
  
  // Determine the document type based on the last document type or name
  let documentCategory = 'unknown';
  
  console.log(`Determining document category for type=${lastDocumentType}, name=${lastDocumentName}`);
  
  // Exact match for document types from CriteriaDocumentUploader
  if (lastDocumentType === 'degree') {
    documentCategory = 'diploma';
  } else if (lastDocumentType === 'resume') {
    documentCategory = 'resume';
  } else if (lastDocumentType === 'license') {
    documentCategory = 'license';
  } else if (lastDocumentType === 'employment') {
    documentCategory = 'employment';
  } else if (lastDocumentType === 'support') {
    documentCategory = 'letter';
  } else if (lastDocumentType === 'recognition') {
    documentCategory = 'award';
  } else if (lastDocumentType === 'press') {
    documentCategory = 'publication';
  } 
  // Fallback to partial matches if exact match fails
  else if (lastDocumentType.includes('degree') || 
      lastDocumentType.includes('diploma') || 
      lastDocumentName.includes('degree') || 
      lastDocumentName.includes('diploma')) {
    documentCategory = 'diploma';
  } else if (lastDocumentType.includes('resume') || 
             lastDocumentName.includes('resume') || 
             lastDocumentName.includes('cv')) {
    documentCategory = 'resume';
  } else if (lastDocumentType.includes('license') || 
             lastDocumentType.includes('membership') || 
             lastDocumentName.includes('license') || 
             lastDocumentName.includes('membership')) {
    documentCategory = 'license';
  } else if (lastDocumentType.includes('employment') || 
             lastDocumentName.includes('employment') || 
             lastDocumentName.includes('work')) {
    documentCategory = 'employment';
  } else if (lastDocumentType.includes('support') || 
             lastDocumentType.includes('letter') || 
             lastDocumentName.includes('letter') || 
             lastDocumentName.includes('recommendation')) {
    documentCategory = 'letter';
  } else if (lastDocumentType.includes('recognition') || 
             lastDocumentType.includes('award') || 
             lastDocumentName.includes('award') || 
             lastDocumentName.includes('certificate')) {
    documentCategory = 'award';
  } else if (lastDocumentType.includes('press') || 
             lastDocumentType.includes('media') || 
             lastDocumentName.includes('article') || 
             lastDocumentName.includes('publication')) {
    documentCategory = 'publication';
  }
  
  console.log(`Determined document category: ${documentCategory}`);
  
  // Generate appropriate mock text based on the document category
  let mockText = '';
  
  switch (documentCategory) {
    case 'diploma':
      mockText = "This document appears to be a diploma certifying the completion of a degree program. It contains information about the academic institution, the degree awarded (Bachelor's/Master's/PhD), the field of study, the date of graduation, and the recipient's name. The document includes official seals, signatures of institutional authorities, and may list academic honors or distinctions.";
      break;
    case 'resume':
      mockText = "This document appears to be a professional resume/CV detailing the individual's career history, educational background, skills, and achievements. It includes sections for work experience with company names, positions held, dates of employment, and key responsibilities. The education section lists degrees earned, institutions attended, and graduation dates. Additional sections cover technical skills, certifications, publications, and professional affiliations relevant to their field.";
      break;
    case 'license':
      mockText = "This document appears to be a professional license or membership certificate verifying the individual's qualifications to practice in a regulated profession. It includes the licensing authority or professional organization name, the individual's name, license/membership number, date of issuance, expiration date, and the specific field or specialty. The document contains official seals or watermarks and signatures of the issuing authority representatives.";
      break;
    case 'employment':
      mockText = "This document appears to be an employment verification letter confirming the individual's position, tenure, responsibilities, and achievements within the organization. It is printed on company letterhead, includes the employer's contact information, and is signed by a supervisor or HR representative. The letter details the employee's job title, employment dates, salary information, and describes their key responsibilities and notable contributions to the organization.";
      break;
    case 'letter':
      mockText = "This document appears to be a letter of recommendation or support highlighting the professional achievements and skills of the subject. It is written on official letterhead and signed by a senior professional or expert in the field. The letter discusses the writer's relationship to the subject, the subject's expertise and contributions to their field, specific examples of their exceptional abilities, and an endorsement of their qualifications for immigration purposes.";
      break;
    case 'award':
      mockText = "This document appears to be an award certificate or recognition letter acknowledging outstanding achievements or contributions in a specific field or industry. It includes the name of the awarding organization, the recipient's name, the title of the award, the date presented, and a description of the achievement being recognized. The document contains official seals or logos and is signed by representatives of the awarding organization.";
      break;
    case 'publication':
      mockText = "This document appears to be a published article, research paper, or media feature related to the individual's professional work. It includes the publication name, date of publication, author information, and content discussing the individual's expertise, innovations, or contributions to their field. The document may contain citations, references, images, or data visualizations supporting the main content.";
      break;
    default:
      mockText = "This document appears to contain information relevant to the immigration case. It provides evidence of the applicant's qualifications, achievements, or background. The document includes dates, names, and specific details that would be useful for establishing the applicant's eligibility for the visa category.";
  }
  
  // Return a more realistic mock result
  return {
    text: mockText,
    numpages: Math.floor(Math.random() * 5) + 1, // Random page count between 1-5
    info: {
      enhanced: true,
      documentCategory,
      message: "This is an intelligent mock PDF parser for browser environments"
    }
  };
};

export default mockPdfParse;
