/**
 * Test script to verify document upload functionality after fixing RLS policies
 * 
 * This script can be run in the browser console on the deployed application
 * to test if document uploads are working correctly.
 */

async function testDocumentUpload() {
  console.log('Starting document upload test...');
  
  try {
    // Get the Supabase client from the window object
    const supabase = window.supabase;
    
    if (!supabase) {
      console.error('Supabase client not found on window object');
      return;
    }
    
    // Create a small test file (a simple text file)
    const testFileContent = 'This is a test file to verify document upload functionality.';
    const testFile = new File([testFileContent], 'test-document.txt', { type: 'text/plain' });
    
    console.log('Created test file:', testFile);
    
    // Upload the file to the documents bucket
    console.log('Uploading file to documents bucket...');
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`test-uploads/${Date.now()}-test-document.txt`, testFile);
    
    if (error) {
      console.error('Error uploading file:', error);
      return;
    }
    
    console.log('File uploaded successfully:', data);
    
    // Try to download the file to verify it was uploaded correctly
    console.log('Downloading file to verify upload...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(data.path);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return;
    }
    
    console.log('File downloaded successfully:', downloadData);
    
    // Read the downloaded file content
    const reader = new FileReader();
    reader.onload = function(e) {
      const downloadedContent = e.target.result;
      console.log('Downloaded file content:', downloadedContent);
      
      // Verify the content matches
      if (downloadedContent === testFileContent) {
        console.log('TEST PASSED: File content matches the original');
      } else {
        console.error('TEST FAILED: File content does not match the original');
      }
    };
    reader.readAsText(downloadData);
    
    return data;
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

// Instructions to run the test:
// 1. Open the deployed application in the browser
// 2. Open the browser console (F12 or right-click > Inspect > Console)
// 3. Copy and paste this entire script into the console
// 4. Run the testDocumentUpload() function by typing: testDocumentUpload()
// 5. Check the console output to see if the test passed or failed
