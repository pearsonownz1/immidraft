import { useEffect, useState } from 'react';

// Import the sample letters data
let sampleLetters = [];

// Try to load the sample letters from the JSON file
try {
  const importSampleLetters = async () => {
    try {
      const module = await import('../data/sampleLetters.json', { assert: { type: 'json' } });
      sampleLetters = module.default;
    } catch (error) {
      console.error('Error loading sample letters:', error);
      sampleLetters = [];
    }
  };
  
  // Load the sample letters immediately
  importSampleLetters();
} catch (error) {
  console.error('Error importing sample letters:', error);
}

/**
 * Service for working with sample letters
 */
class SampleLetterService {
  /**
   * Get all sample letters
   * @returns {Array} All sample letters
   */
  getAllSamples() {
    return sampleLetters;
  }
  
  /**
   * Normalize visa type to handle different formats (EB-1, EB1, EB1A, etc.)
   * @param {string} visaType - The visa type to normalize
   * @returns {string} The normalized visa type
   */
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
  
  /**
   * Get sample letters for a specific visa type
   * @param {string} visaType - The visa type to filter by
   * @returns {Array} Sample letters for the specified visa type
   */
  getSamplesByVisaType(visaType) {
    const normalizedType = this.normalizeVisaType(visaType);
    return sampleLetters.filter(sample => 
      this.normalizeVisaType(sample.visaType) === normalizedType
    );
  }
  
  /**
   * Get the best sample letter for a specific visa type and tags
   * @param {string} visaType - The visa type to filter by
   * @param {Array} tags - Tags to prioritize (optional)
   * @returns {Object} The best matching sample letter
   */
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
  
  /**
   * Get a sample letter by ID
   * @param {string} id - The ID of the sample letter
   * @returns {Object} The sample letter with the specified ID
   */
  getSampleById(id) {
    return sampleLetters.find(sample => sample.id === id);
  }
  
  /**
   * Get a random sample letter for a specific visa type
   * @param {string} visaType - The visa type to filter by
   * @returns {Object} A random sample letter for the specified visa type
   */
  getRandomSampleForVisaType(visaType) {
    const samples = this.getSamplesByVisaType(visaType);
    
    if (samples.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * samples.length);
    return samples[randomIndex];
  }
}

// Create and export the service instance
export const sampleLetterService = new SampleLetterService();

// Export a hook for React components
export function useSampleLetters(visaType, tags) {
  const [samples, setSamples] = useState([]);
  const [bestSample, setBestSample] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSamples = async () => {
      try {
        if (visaType) {
          const filteredSamples = sampleLetterService.getSamplesByVisaType(visaType);
          setSamples(filteredSamples);
          
          if (tags && tags.length > 0) {
            const best = sampleLetterService.getBestSampleForVisaType(visaType, tags);
            setBestSample(best);
          } else {
            setBestSample(filteredSamples[0] || null);
          }
        } else {
          setSamples(sampleLetterService.getAllSamples());
          setBestSample(null);
        }
      } catch (error) {
        console.error('Error loading sample letters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSamples();
  }, [visaType, tags]);
  
  return { samples, bestSample, loading };
}

export default sampleLetterService;
