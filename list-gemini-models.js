// Script to list available Gemini models
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listGeminiModels() {
  try {
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List available models
    console.log('Listing available Gemini models...');
    const result = await genAI.listModels();
    
    console.log('Available models:');
    result.models.forEach(model => {
      console.log(`- Name: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Description: ${model.description}`);
      console.log(`  Input Token Limit: ${model.inputTokenLimit}`);
      console.log(`  Output Token Limit: ${model.outputTokenLimit}`);
      console.log(`  Supported Generation Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error listing Gemini models:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Execute the function
listGeminiModels();
