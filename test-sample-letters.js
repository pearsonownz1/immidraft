import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the sample letters directly from the JSON file
const sampleLettersPath = path.join(__dirname, 'src/data/sampleLetters.json');

// Create a simple version of the service for testing
class SampleLetterService {
  constructor(samples) {
    this.samples = samples;
  }
  
  getAllSamples() {
    return this.samples;
  }
  
  normalizeVisaType(visaType) {
    if (!visaType) return '';
    
    // Convert to uppercase
    const upperType = visaType.toUpperCase();
    
    // Handle common variations
    if (upperType.startsWith('EB-1') || upperType.startsWith('EB1')) {
      return 'EB1';
    }
    if (upperType.startsWith('EB-2') || upperType.startsWith('EB2')) {
      return 'EB2';
    }
    if (upperType.startsWith('EB-3') || upperType.startsWith('EB3')) {
      return 'EB3';
    }
    if (upperType.startsWith('O-1') || upperType.startsWith('O1')) {
      return 'O1';
    }
    if (upperType.startsWith('L-1') || upperType.startsWith('L1')) {
      return 'L1';
    }
    if (upperType.startsWith('H-1B') || upperType.startsWith('H1B')) {
      return 'H1B';
    }
    if (upperType.startsWith('P-1') || upperType.startsWith('P1')) {
      return 'P1';
    }
    if (upperType.startsWith('P-3') || upperType.startsWith('P3')) {
      return 'P3';
    }
    
    // If no match, return the original
    return visaType;
  }
  
  getSamplesByVisaType(visaType) {
    const normalizedType = this.normalizeVisaType(visaType);
    return this.samples.filter(sample => 
      this.normalizeVisaType(sample.visaType) === normalizedType
    );
  }
  
  getBestSampleForVisaType(visaType, tags = []) {
    const samples = this.getSamplesByVisaType(visaType);
    
    if (samples.length === 0) {
      return null;
    }
    
    // If no tags provided, return the first sample
    if (!tags || tags.length === 0) {
      return samples[0];
    }
    
    // Score samples based on tag matches
    const scoredSamples = samples.map(sample => {
      let score = 0;
      
      // Score based on tag matches
      if (sample.tags && Array.isArray(sample.tags)) {
        tags.forEach(tag => {
          if (sample.tags.includes(tag)) {
            score += 1;
          }
        });
      }
      
      return { sample, score };
    });
    
    // Sort by score (highest first)
    scoredSamples.sort((a, b) => b.score - a.score);
    
    // Return the highest scoring sample
    return scoredSamples[0].sample;
  }
}

// Main function
async function main() {
  try {
    // Read the sample letters from the JSON file
    const data = await fs.promises.readFile(sampleLettersPath, 'utf8');
    const sampleLetters = JSON.parse(data);
    
    // Create an instance of the service
    const sampleLetterService = new SampleLetterService(sampleLetters);
    
    // Get all samples
    const allSamples = sampleLetterService.getAllSamples();
    console.log(`Total sample letters: ${allSamples.length}`);
    
    // Get samples by visa type
    const eb1Samples = sampleLetterService.getSamplesByVisaType('EB1');
    console.log(`EB1 samples: ${eb1Samples.length}`);
    
    const o1Samples = sampleLetterService.getSamplesByVisaType('O1');
    console.log(`O1 samples: ${o1Samples.length}`);
    
    // Get best sample for a visa type
    const bestEB1Sample = sampleLetterService.getBestSampleForVisaType('EB1', ['research', 'academic']);
    if (bestEB1Sample) {
      console.log(`Best EB1 sample: ${bestEB1Sample.title}`);
      console.log(`Tags: ${bestEB1Sample.tags.join(', ')}`);
    } else {
      console.log('No EB1 sample found');
    }
    
    const bestO1Sample = sampleLetterService.getBestSampleForVisaType('O1', ['art']);
    if (bestO1Sample) {
      console.log(`Best O1 sample: ${bestO1Sample.title}`);
      console.log(`Tags: ${bestO1Sample.tags.join(', ')}`);
    } else {
      console.log('No O1 sample found');
    }
    
    // Test visa type normalization
    console.log(`\nTesting visa type normalization:`);
    console.log(`EB-1 -> ${sampleLetterService.normalizeVisaType('EB-1')}`);
    console.log(`EB1A -> ${sampleLetterService.normalizeVisaType('EB1A')}`);
    console.log(`O-1B -> ${sampleLetterService.normalizeVisaType('O-1B')}`);
    console.log(`EB2 NIW -> ${sampleLetterService.normalizeVisaType('EB2 NIW')}`);
  } catch (error) {
    console.error('Error testing sample letters:', error);
  }
}

// Run the main function
main();
