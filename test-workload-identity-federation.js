// Test script for Workload Identity Federation with Google Cloud Document AI
// This script tests if the credentials are properly configured

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Function to decode and use the credentials
function getCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }
  
  try {
    // Decode the base64-encoded credentials
    const decodedCredentials = Buffer.from(credentialsJson, 'base64').toString('utf-8');
    return JSON.parse(decodedCredentials);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format');
  }
}

// Main test function
async function testWorkloadIdentityFederation() {
  console.log(`${colors.cyan}Testing Workload Identity Federation setup...${colors.reset}`);
  
  // Step 1: Check if the environment variable is set
  console.log(`\n${colors.blue}Step 1: Checking environment variable...${colors.reset}`);
  try {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson) {
      console.log(`${colors.red}❌ GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set${colors.reset}`);
      console.log(`${colors.yellow}Hint: Make sure to set this environment variable with the base64-encoded credentials${colors.reset}`);
      return;
    }
    console.log(`${colors.green}✅ GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is set${colors.reset}`);
    
    // Step 2: Try to decode the credentials
    console.log(`\n${colors.blue}Step 2: Decoding credentials...${colors.reset}`);
    const decodedCredentials = Buffer.from(credentialsJson, 'base64').toString('utf-8');
    const parsedCredentials = JSON.parse(decodedCredentials);
    console.log(`${colors.green}✅ Credentials successfully decoded and parsed${colors.reset}`);
    
    // Step 3: Check if the credentials have the expected format
    console.log(`\n${colors.blue}Step 3: Validating credentials format...${colors.reset}`);
    if (!parsedCredentials.type || parsedCredentials.type !== 'external_account') {
      console.log(`${colors.red}❌ Credentials are not of type 'external_account'${colors.reset}`);
      console.log(`${colors.yellow}Hint: Make sure you're using Workload Identity Federation credentials${colors.reset}`);
      return;
    }
    console.log(`${colors.green}✅ Credentials have the correct format (external_account)${colors.reset}`);
    
    // Step 4: Initialize the Document AI client
    console.log(`\n${colors.blue}Step 4: Initializing Document AI client...${colors.reset}`);
    const documentAiClient = new DocumentProcessorServiceClient({
      credentials: parsedCredentials
    });
    console.log(`${colors.green}✅ Document AI client initialized successfully${colors.reset}`);
    
    // Step 5: Try to list processors (this will test the authentication)
    console.log(`\n${colors.blue}Step 5: Testing authentication by listing processors...${colors.reset}`);
    try {
      const projectId = '602726513834';
      const location = 'us';
      const [processors] = await documentAiClient.listProcessors({
        parent: `projects/${projectId}/locations/${location}`
      });
      
      console.log(`${colors.green}✅ Authentication successful! Found ${processors.length} processors${colors.reset}`);
      processors.forEach((processor, i) => {
        console.log(`   ${i + 1}. ${processor.displayName} (${processor.name})`);
      });
      
      console.log(`\n${colors.green}🎉 Workload Identity Federation is correctly set up!${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}❌ Authentication failed${colors.reset}`);
      console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
      console.log(`\n${colors.yellow}Possible reasons:${colors.reset}`);
      console.log(`${colors.yellow}1. The service account doesn't have the necessary permissions${colors.reset}`);
      console.log(`${colors.yellow}2. The Workload Identity Pool is not correctly configured${colors.reset}`);
      console.log(`${colors.yellow}3. The OIDC provider is not correctly set up${colors.reset}`);
      console.log(`${colors.yellow}4. The attribute mappings are incorrect${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
  }
}

// Run the test
testWorkloadIdentityFederation().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
