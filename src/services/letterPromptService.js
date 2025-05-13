import { sampleLetterService } from './sampleLetterService.js';

/**
 * Service for generating prompts with sample letter injection
 */
class LetterPromptService {
  /**
   * Generate a prompt for a letter with a sample letter injected
   * @param {string} visaType - The visa type for the letter
   * @param {Array} tags - Tags to help select the most relevant sample
   * @param {Object} evidence - Evidence to include in the prompt
   * @returns {string} The generated prompt
   */
  generatePromptWithSample(visaType, tags = [], evidence = {}) {
    // Get the best sample letter for this visa type and tags
    const sample = sampleLetterService.getBestSampleForVisaType(visaType, tags);
    
    if (!sample) {
      // Fallback prompt if no sample is found
      return this.generateFallbackPrompt(visaType, evidence);
    }
    
    // Build the prompt with the sample letter
    return `
You are writing an expert opinion letter for a ${visaType} visa petition.

Here is a high-quality sample of an actual letter used for a successful ${visaType} case:

===
${sample.content}
===

Now, using the following summarized evidence, write a new expert letter in the same format and tone:

${this.formatEvidence(evidence)}

Important guidelines:
1. Follow the structure and tone of the sample letter closely
2. Customize the content based on the provided evidence
3. Be specific and detailed in your assessment
4. Use formal, professional language appropriate for immigration purposes
5. Focus on how the applicant meets the specific criteria for the ${visaType} visa category
6. Include a clear conclusion that explicitly states your expert opinion on the applicant's qualifications
`;
  }
  
  /**
   * Generate a fallback prompt when no sample letter is available
   * @param {string} visaType - The visa type for the letter
   * @param {Object} evidence - Evidence to include in the prompt
   * @returns {string} The generated fallback prompt
   */
  generateFallbackPrompt(visaType, evidence = {}) {
    return `
You are writing an expert opinion letter for a ${visaType} visa petition.

Using the following summarized evidence, write a professional expert opinion letter:

${this.formatEvidence(evidence)}

Your letter should include:
1. Introduction stating your qualifications as an expert
2. Your relationship to the applicant (if any)
3. Detailed assessment of the applicant's qualifications
4. Specific examples from the evidence that demonstrate extraordinary ability
5. Clear conclusion stating your expert opinion on the applicant's qualifications
6. Professional closing

Use formal, professional language appropriate for immigration purposes.
`;
  }
  
  /**
   * Format the evidence for inclusion in the prompt
   * @param {Object} evidence - Evidence to format
   * @returns {string} Formatted evidence
   */
  formatEvidence(evidence) {
    if (!evidence || Object.keys(evidence).length === 0) {
      return 'No evidence provided.';
    }
    
    let formattedEvidence = '';
    
    // Format applicant information
    if (evidence.applicant) {
      formattedEvidence += `APPLICANT INFORMATION:\n`;
      formattedEvidence += `Name: ${evidence.applicant.name || 'Not provided'}\n`;
      formattedEvidence += `Field: ${evidence.applicant.field || 'Not provided'}\n`;
      formattedEvidence += `Current Position: ${evidence.applicant.position || 'Not provided'}\n`;
      formattedEvidence += `\n`;
    }
    
    // Format expert information
    if (evidence.expert) {
      formattedEvidence += `EXPERT INFORMATION:\n`;
      formattedEvidence += `Name: ${evidence.expert.name || 'Not provided'}\n`;
      formattedEvidence += `Credentials: ${evidence.expert.credentials || 'Not provided'}\n`;
      formattedEvidence += `Position: ${evidence.expert.position || 'Not provided'}\n`;
      formattedEvidence += `Relationship to Applicant: ${evidence.expert.relationship || 'None'}\n`;
      formattedEvidence += `\n`;
    }
    
    // Format achievements
    if (evidence.achievements && Array.isArray(evidence.achievements)) {
      formattedEvidence += `ACHIEVEMENTS:\n`;
      evidence.achievements.forEach((achievement, index) => {
        formattedEvidence += `${index + 1}. ${achievement}\n`;
      });
      formattedEvidence += `\n`;
    }
    
    // Format publications
    if (evidence.publications && Array.isArray(evidence.publications)) {
      formattedEvidence += `PUBLICATIONS:\n`;
      evidence.publications.forEach((publication, index) => {
        formattedEvidence += `${index + 1}. ${publication}\n`;
      });
      formattedEvidence += `\n`;
    }
    
    // Format awards
    if (evidence.awards && Array.isArray(evidence.awards)) {
      formattedEvidence += `AWARDS:\n`;
      evidence.awards.forEach((award, index) => {
        formattedEvidence += `${index + 1}. ${award}\n`;
      });
      formattedEvidence += `\n`;
    }
    
    // Format other evidence
    if (evidence.other) {
      formattedEvidence += `ADDITIONAL EVIDENCE:\n${evidence.other}\n\n`;
    }
    
    return formattedEvidence;
  }
  
  /**
   * Generate a prompt for a letter with multiple samples to choose from
   * @param {string} visaType - The visa type for the letter
   * @param {number} sampleCount - Number of samples to include (default: 3)
   * @param {Object} evidence - Evidence to include in the prompt
   * @returns {string} The generated prompt with multiple samples
   */
  generatePromptWithMultipleSamples(visaType, sampleCount = 3, evidence = {}) {
    // Get samples for this visa type
    const samples = sampleLetterService.getSamplesByVisaType(visaType);
    
    if (!samples || samples.length === 0) {
      // Fallback to regular prompt if no samples are found
      return this.generateFallbackPrompt(visaType, evidence);
    }
    
    // Limit to the requested number of samples
    const limitedSamples = samples.slice(0, Math.min(sampleCount, samples.length));
    
    // Build the prompt with multiple sample letters
    let prompt = `
You are writing an expert opinion letter for a ${visaType} visa petition.

Here are ${limitedSamples.length} high-quality samples of actual letters used for successful ${visaType} cases:

`;
    
    // Add each sample
    limitedSamples.forEach((sample, index) => {
      prompt += `SAMPLE ${index + 1}:\n`;
      prompt += `===\n`;
      prompt += `${sample.content}\n`;
      prompt += `===\n\n`;
    });
    
    prompt += `
Now, using the following summarized evidence, write a new expert letter that incorporates the best elements from these samples:

${this.formatEvidence(evidence)}

Important guidelines:
1. Analyze the structure and tone of the sample letters
2. Incorporate the strongest elements from each sample
3. Customize the content based on the provided evidence
4. Be specific and detailed in your assessment
5. Use formal, professional language appropriate for immigration purposes
6. Focus on how the applicant meets the specific criteria for the ${visaType} visa category
7. Include a clear conclusion that explicitly states your expert opinion on the applicant's qualifications
`;
    
    return prompt;
  }
}

// Create and export the service instance
export const letterPromptService = new LetterPromptService();

export default letterPromptService;
