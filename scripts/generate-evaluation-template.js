import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert a text template to a DOCX file
 */
async function convertTextTemplateToDocx() {
  try {
    console.log('Converting text template to DOCX...');
    
    // Read the text template
    const textTemplatePath = path.join(__dirname, '../public/templates/Evaluation_Letter_Template_With_Placeholders.txt');
    const textTemplate = await readFileAsync(textTemplatePath, 'utf8');
    
    // Create a simple DOCX template with the text content
    // We'll use a basic DOCX template and replace its content with our text
    const basicDocxPath = path.join(__dirname, 'basic-template.docx');
    
    // Check if we have a basic template, if not create one
    if (!fs.existsSync(basicDocxPath)) {
      console.log('Creating basic DOCX template...');
      await createBasicDocxTemplate(basicDocxPath);
    }
    
    // Load the basic template
    const content = await readFileAsync(basicDocxPath);
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });
    
    // Set the template data with the text content
    doc.render({ content: textTemplate });
    
    // Generate the output
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });
    
    // Ensure the templates directory exists
    const templatesDir = path.join(__dirname, '../public/templates');
    if (!fs.existsSync(templatesDir)) {
      await mkdirAsync(templatesDir, { recursive: true });
    }
    
    // Write the output file
    const outputPath = path.join(templatesDir, 'Evaluation_Letter_Template_With_Placeholders.docx');
    await writeFileAsync(outputPath, buf);
    
    console.log(`DOCX template created successfully at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error converting template:', error);
    throw error;
  }
}

/**
 * Create a basic DOCX template with a content placeholder
 */
async function createBasicDocxTemplate(outputPath) {
  try {
    // For simplicity, we'll use a pre-existing DOCX file as a base
    // In a real-world scenario, you might want to use a library like officegen
    // to create a DOCX file from scratch
    
    // Create a minimal DOCX template with a content placeholder
    const minimalTemplate = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:t>{content}</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    `;
    
    // Create a ZIP file with the minimal template
    const zip = new PizZip();
    zip.file('word/document.xml', minimalTemplate);
    
    // Add other required files for a valid DOCX
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
    
    // Generate the output
    const buf = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });
    
    // Write the output file
    await writeFileAsync(outputPath, buf);
    
    console.log(`Basic DOCX template created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error creating basic DOCX template:', error);
    throw error;
  }
}

// Run the conversion
convertTextTemplateToDocx()
  .then(() => {
    console.log('Template conversion completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Template conversion failed:', error);
    process.exit(1);
  });
