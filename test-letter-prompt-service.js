import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the sample letters directly from the JSON file
const sampleLettersPath = path.join(__dirname, 'src/data/sampleLetters.json');

// Import the letterPromptService implementation
import { letterPromptService } from './src/services/letterPromptService.js';

// Sample evidence for testing
const sampleEvidence = {
  applicant: {
    name: "Dr. Maria Rodriguez",
    field: "Artificial Intelligence and Machine Learning",
    position: "Senior Research Scientist at Tech Innovations Inc."
  },
  expert: {
    name: "Dr. James Wilson",
    credentials: "Ph.D. in Computer Science, MIT",
    position: "Professor of Computer Science at Stanford University",
    relationship: "Professional acquaintance through conferences"
  },
  achievements: [
    "Developed a novel deep learning architecture that improved image recognition accuracy by 15%",
    "Led a team of 5 researchers in developing AI solutions for healthcare diagnostics",
    "Implemented machine learning algorithms that reduced diagnostic errors by 30%"
  ],
  publications: [
    "Rodriguez, M. et al. (2023). 'Advanced Neural Networks for Medical Imaging.' Nature Machine Intelligence, 5(2), 112-118.",
    "Rodriguez, M. & Johnson, T. (2022). 'Reinforcement Learning in Healthcare Decision Support Systems.' IEEE Transactions on Medical Imaging, 41(8), 1925-1937.",
    "Rodriguez, M. (2021). 'Transfer Learning Approaches for Limited Medical Data.' Conference on Neural Information Processing Systems (NeurIPS), 2021."
  ],
  awards: [
    "Outstanding Research Award, International Conference on Machine Learning (2023)",
    "Innovation in AI Award, Tech Innovations Inc. (2022)",
    "Best Paper Award, Conference on Computer Vision and Pattern Recognition (2021)"
  ],
  other: "Dr. Rodriguez has been invited as a keynote speaker at 5 international conferences. Her work has been cited over 1,000 times according to Google Scholar. She has served as a reviewer for top journals in the field and has mentored 12 graduate students."
};

// Main function
async function main() {
  try {
    // Read the sample letters from the JSON file
    const data = await fs.promises.readFile(sampleLettersPath, 'utf8');
    const sampleLetters = JSON.parse(data);
    
    console.log("Testing Letter Prompt Service\n");
    
    // Test generating a prompt with a sample letter
    console.log("1. Testing generatePromptWithSample for EB1 visa type:");
    const eb1Prompt = letterPromptService.generatePromptWithSample('EB1', ['research', 'academic'], sampleEvidence);
    console.log(`Prompt length: ${eb1Prompt.length} characters`);
    console.log(`First 500 characters: ${eb1Prompt.substring(0, 500)}...\n`);
    
    // Test generating a prompt with a sample letter for O1
    console.log("2. Testing generatePromptWithSample for O1 visa type:");
    const o1Prompt = letterPromptService.generatePromptWithSample('O1', ['art'], sampleEvidence);
    console.log(`Prompt length: ${o1Prompt.length} characters`);
    console.log(`First 500 characters: ${o1Prompt.substring(0, 500)}...\n`);
    
    // Test generating a prompt with multiple samples
    console.log("3. Testing generatePromptWithMultipleSamples for EB1 visa type:");
    const multiSamplePrompt = letterPromptService.generatePromptWithMultipleSamples('EB1', 2, sampleEvidence);
    console.log(`Prompt length: ${multiSamplePrompt.length} characters`);
    console.log(`First 500 characters: ${multiSamplePrompt.substring(0, 500)}...\n`);
    
    // Test fallback prompt
    console.log("4. Testing fallback prompt for a non-existent visa type:");
    const fallbackPrompt = letterPromptService.generatePromptWithSample('XYZ', [], sampleEvidence);
    console.log(`Prompt length: ${fallbackPrompt.length} characters`);
    console.log(`First 500 characters: ${fallbackPrompt.substring(0, 500)}...\n`);
    
    // Test evidence formatting
    console.log("5. Testing evidence formatting:");
    const formattedEvidence = letterPromptService.formatEvidence(sampleEvidence);
    console.log(formattedEvidence);
    
  } catch (error) {
    console.error('Error testing letter prompt service:', error);
  }
}

// Run the main function
main();
