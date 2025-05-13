/**
 * Mock Document AI Service
 * 
 * This service provides mock implementations of Google Cloud Document AI functionality
 * for testing and development purposes.
 * 
 * NOTE: This version has been modified to be browser-compatible by removing Node.js-specific imports.
 */

/**
 * Mock function to extract text from a document using Document AI
 * @param {string} documentBytes Base64 encoded document content
 * @param {string} mimeType MIME type of the document
 * @returns {Promise<string>} Extracted text from the document
 */
export async function mockExtractTextWithDocumentAI(documentBytes, mimeType) {
  console.log(`Mock Document AI: Processing ${mimeType} document...`);
  
  // For PDF files, return a mock extracted text
  if (mimeType === 'application/pdf') {
    return `
John Doe
Senior Software Engineer

Email: john.doe@example.com | Phone: (123) 456-7890
Location: San Francisco, CA | Website: johndoe.dev

Summary
Experienced software engineer with over 8 years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering high-quality, scalable applications for enterprise clients. Strong problem-solving skills and a passion for creating efficient, user-friendly software solutions.

Experience
Senior Software Engineer - TechCorp Inc. | January 2020 - Present
- Led a team of 5 developers in building a microservices-based e-commerce platform that increased sales by 35%
- Architected and implemented a React-based frontend with TypeScript, resulting in a 40% improvement in load times
- Designed and deployed AWS infrastructure using Terraform, reducing operational costs by 25%
- Implemented CI/CD pipelines with GitHub Actions, decreasing deployment time from hours to minutes
- Mentored junior developers and conducted code reviews to ensure code quality and best practices

Software Engineer - InnovateSoft LLC | March 2017 - December 2019
- Developed and maintained multiple client-facing web applications using React, Redux, and Node.js
- Implemented RESTful APIs and GraphQL endpoints for data retrieval and manipulation
- Optimized database queries and implemented caching strategies, improving application performance by 30%
- Collaborated with UX/UI designers to implement responsive designs and ensure cross-browser compatibility

Education
Master of Science in Computer Science - Stanford University | 2013 - 2015
Bachelor of Science in Computer Science - UC Berkeley | 2009 - 2013
`;
  }
  
  // For other file types, return a simple mock text
  return `Mock Document AI: Extracted text from ${mimeType} document.`;
}

/**
 * Mock function to generate a summary of a document using OpenAI
 * @param {string} text Text to summarize
 * @returns {Promise<string>} Summary of the text
 */
export async function mockGenerateSummaryWithOpenAI(text) {
  console.log('Mock OpenAI: Generating summary...');
  
  // Return a mock summary based on the input text
  if (text.includes('John Doe')) {
    return 'John Doe is a Senior Software Engineer with 8+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. He has worked at TechCorp Inc. since January 2020, where he led a team building a microservices-based e-commerce platform. Previously, he worked at InnovateSoft LLC developing web applications. He holds a Master\'s degree in Computer Science from Stanford University and a Bachelor\'s degree from UC Berkeley.';
  }
  
  return 'Mock OpenAI: Generated summary for the provided text.';
}

/**
 * Mock function to generate tags for a document using OpenAI
 * @param {string} text Text to generate tags for
 * @returns {Promise<string[]>} Array of tags
 */
export async function mockGenerateTagsWithOpenAI(text) {
  console.log('Mock OpenAI: Generating tags...');
  
  // Return mock tags based on the input text
  if (text.includes('John Doe')) {
    return [
      'Software Engineer',
      'React',
      'Node.js',
      'AWS',
      'TypeScript',
      'Microservices',
      'CI/CD',
      'Full-Stack Development',
      'Cloud Technologies',
      'Stanford University'
    ];
  }
  
  return ['Mock Tag 1', 'Mock Tag 2', 'Mock Tag 3'];
}

/**
 * Mock function to process a document using Document AI and OpenAI
 * @param {string} documentBytes Base64 encoded document content
 * @param {string} mimeType MIME type of the document
 * @returns {Promise<Object>} Object containing extracted text, summary, and tags
 */
export async function mockProcessDocument(documentBytes, mimeType) {
  // Extract text from the document
  const extractedText = await mockExtractTextWithDocumentAI(documentBytes, mimeType);
  
  // Generate summary and tags
  const summary = await mockGenerateSummaryWithOpenAI(extractedText);
  const tags = await mockGenerateTagsWithOpenAI(extractedText);
  
  return {
    extractedText,
    summary,
    tags
  };
}
