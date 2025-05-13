import { letterService } from './src/services/letterService.js';
import { supabase } from './src/lib/supabase.js';

// Test the letterService
async function testLetterService() {
  console.log('Testing letterService...');
  
  try {
    // Create a test letter
    console.log('Creating a test letter...');
    const testLetter = {
      title: 'Test Letter',
      content: 'This is a test letter content.',
      client_name: 'Test Client',
      visa_type: 'O-1A',
      letter_type: 'expert',
      beneficiary_name: 'Test Beneficiary',
      tags: ['test', 'sample']
    };
    
    const createdLetter = await letterService.createLetter(testLetter);
    console.log('Created letter:', createdLetter);
    
    if (!createdLetter || !createdLetter.id) {
      throw new Error('Failed to create letter');
    }
    
    // Get all letters
    console.log('\nGetting all letters...');
    const allLetters = await letterService.getLetters();
    console.log(`Found ${allLetters.length} letters`);
    
    // Get the letter by ID
    console.log('\nGetting letter by ID...');
    const retrievedLetter = await letterService.getLetterById(createdLetter.id);
    console.log('Retrieved letter:', retrievedLetter);
    
    // Update the letter
    console.log('\nUpdating letter...');
    const updatedLetter = await letterService.updateLetter(createdLetter.id, {
      title: 'Updated Test Letter',
      content: 'This is an updated test letter content.'
    });
    console.log('Updated letter:', updatedLetter);
    
    // Delete the letter
    console.log('\nDeleting letter...');
    const deleteResult = await letterService.deleteLetter(createdLetter.id);
    console.log('Delete result:', deleteResult);
    
    // Verify deletion
    console.log('\nVerifying deletion...');
    const lettersAfterDelete = await letterService.getLetters();
    const letterExists = lettersAfterDelete.some(letter => letter.id === createdLetter.id);
    console.log(`Letter still exists: ${letterExists}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing letterService:', error);
  } finally {
    // Close the Supabase connection
    supabase.auth.signOut();
  }
}

// Run the test
testLetterService();
