import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use fs promises API
const { readdir, stat, readFile, writeFile, mkdir } = fs.promises;

// Configuration
const samplesDir = path.join(__dirname, '../public/samples');
const outputFile = path.join(__dirname, '../src/data/sampleLetters.json');

// Ensure the output directory exists
const ensureDirectoryExists = async (filePath) => {
  const dirname = path.dirname(filePath);
  try {
    await stat(dirname);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(dirname, { recursive: true });
    } else {
      throw err;
    }
  }
};

// Process a single file
const processFile = async (filePath, visaType) => {
  try {
    const fileStats = await stat(filePath);
    const content = await readFile(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Extract a title from the file content or use the filename
    let title = fileName;
    const firstLine = content.split('\n')[0].trim();
    if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
      title = firstLine;
    }
    
    // Extract potential tags from the content
    const tags = [];
    
    // Check for common keywords in the content
    if (content.toLowerCase().includes('research')) tags.push('research');
    if (content.toLowerCase().includes('publication')) tags.push('publication');
    if (content.toLowerCase().includes('award')) tags.push('award');
    if (content.toLowerCase().includes('professor')) tags.push('academic');
    if (content.toLowerCase().includes('university')) tags.push('academic');
    if (content.toLowerCase().includes('industry')) tags.push('industry');
    if (content.toLowerCase().includes('business')) tags.push('business');
    if (content.toLowerCase().includes('technology')) tags.push('technology');
    if (content.toLowerCase().includes('science')) tags.push('science');
    if (content.toLowerCase().includes('engineering')) tags.push('engineering');
    if (content.toLowerCase().includes('art')) tags.push('art');
    
    return {
      visaType,
      fileName,
      title,
      content,
      tags,
      fileSize: fileStats.size,
      lastModified: fileStats.mtime.toISOString()
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
};

// Process all files in a directory
const processDirectory = async (dirPath) => {
  try {
    const visaType = path.basename(dirPath);
    const files = await readdir(dirPath);
    
    console.log(`Processing ${files.length} files in ${visaType} directory...`);
    
    const results = [];
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isFile()) {
        const result = await processFile(filePath, visaType);
        if (result) {
          results.push(result);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    return [];
  }
};

// Main function
const main = async () => {
  try {
    // Ensure the output directory exists
    await ensureDirectoryExists(outputFile);
    
    // Get all visa type directories
    const directories = await readdir(samplesDir);
    
    let allSamples = [];
    
    // Process each visa type directory
    for (const dir of directories) {
      const dirPath = path.join(samplesDir, dir);
      const dirStat = await stat(dirPath);
      
      if (dirStat.isDirectory()) {
        const samples = await processDirectory(dirPath);
        allSamples = allSamples.concat(samples);
      }
    }
    
    // Write the results to the output file
    await writeFile(outputFile, JSON.stringify(allSamples, null, 2));
    
    console.log(`Successfully processed ${allSamples.length} sample letters.`);
    console.log(`Output saved to ${outputFile}`);
  } catch (error) {
    console.error('Error in main function:', error);
  }
};

// Run the main function
main();
