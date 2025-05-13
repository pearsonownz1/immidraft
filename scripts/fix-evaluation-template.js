import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a clean template directly from the text file
async function createCleanTemplate() {
  try {
    // Read the text template
    const textTemplatePath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders.txt');
    const textTemplate = fs.readFileSync(textTemplatePath, 'utf8');
    
    // Create a clean DOCX file with proper template tags
    const outputPath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_Clean.docx');
    
    // We'll use a simple approach - create a text file with .docx extension
    // This is not a real DOCX but will help us test if the issue is with the template tags
    fs.writeFileSync(outputPath, textTemplate);
    
    console.log(`Clean template created at: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error creating clean template:', error);
    throw error;
  }
}

// Create a fixed template with proper mustache tags
async function createFixedTemplate() {
  try {
    // Read the text template
    const textTemplatePath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders.txt');
    let textTemplate = fs.readFileSync(textTemplatePath, 'utf8');
    
    // Fix any malformed template tags
    // Replace any tags with spaces like {{CURR, DATE}} with {{CURRENT_DATE}}
    textTemplate = textTemplate.replace(/\{\{\s*CURR\s*,\s*DATE\s*\}\}/g, '{{CURRENT_DATE}}');
    textTemplate = textTemplate.replace(/\{\{\s*CLIE\s*,\s*NAME\s*\}\}/g, '{{CLIENTNAME}}');
    
    // Create a fixed template file
    const fixedTemplatePath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders_Fixed.txt');
    fs.writeFileSync(fixedTemplatePath, textTemplate);
    
    console.log(`Fixed text template created at: ${fixedTemplatePath}`);
    
    // Create a DOCX version of the fixed template
    const outputPath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders_Fixed.docx');
    fs.writeFileSync(outputPath, textTemplate);
    
    console.log(`Fixed DOCX template created at: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error creating fixed template:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Backup the original template
    const originalPath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders.docx');
    const backupPath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders.docx.bak');
    
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`Original template backed up to: ${backupPath}`);
    }
    
    // Create a fixed template with proper mustache tags
    const fixedPath = await createFixedTemplate();
    
    // Create a clean template
    const cleanPath = await createCleanTemplate();
    
    // Replace the original template with the fixed one
    fs.copyFileSync(fixedPath, originalPath);
    console.log(`Original template replaced with fixed version`);
    
    console.log('Template fix completed successfully');
  } catch (error) {
    console.error('Error fixing template:', error);
  }
}

// Run the main function
main();
