#!/usr/bin/env node

/**
 * This script demonstrates the document sorting functionality.
 * It creates a simple test page that shows the DocumentUploader component with the document sorting feature.
 * 
 * Usage:
 * 1. Make this script executable: chmod +x test-document-sorting.js
 * 2. Run the script: ./test-document-sorting.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in the project root
if (!fs.existsSync('package.json')) {
  console.error('Error: This script must be run from the root of your project.');
  process.exit(1);
}

// Create a temporary test page
const testPagePath = path.join('src', 'pages', 'TestDocumentSorting.tsx');
console.log(`Creating temporary test page at ${testPagePath}...`);

const testPageContent = `import React, { useState } from 'react';
import { DocumentUploader } from '@/components/DocumentUploader';

// Sample document data
const sampleDocuments = [
  {
    id: "doc1",
    name: "John_Smith_Resume.pdf",
    type: "pdf",
    size: "245 KB",
    tags: ["resume", "professional"],
    criteria: ["experience"],
    uploadDate: "2025-05-01",
    category: "doc-1" // Resume
  },
  {
    id: "doc2",
    name: "Stanford_Diploma.pdf",
    type: "pdf",
    size: "1.2 MB",
    tags: ["education", "degree"],
    criteria: ["qualifications"],
    uploadDate: "2025-05-02",
    category: "doc-2" // Degree & Diplomas
  },
  {
    id: "doc3",
    name: "Medical_License.pdf",
    type: "pdf",
    size: "890 KB",
    tags: ["license", "medical"],
    criteria: ["qualifications"],
    uploadDate: "2025-05-03",
    category: "doc-3" // License & Membership
  },
  {
    id: "doc4",
    name: "Employment_Verification_Google.pdf",
    type: "pdf",
    size: "156 KB",
    tags: ["employment", "verification"],
    criteria: ["experience"],
    uploadDate: "2025-05-04",
    category: "doc-4" // Employment Records
  },
  {
    id: "doc5",
    name: "Recommendation_Letter_Dr_Johnson.pdf",
    type: "pdf",
    size: "320 KB",
    tags: ["recommendation", "support"],
    criteria: ["references"],
    uploadDate: "2025-05-05",
    category: "doc-5" // Support Letters
  },
  {
    id: "doc6",
    name: "Award_Certificate_Excellence.pdf",
    type: "pdf",
    size: "450 KB",
    tags: ["award", "recognition"],
    criteria: ["achievements"],
    uploadDate: "2025-05-06",
    category: "doc-6" // Recognitions
  },
  {
    id: "doc7",
    name: "News_Article_Innovation.pdf",
    type: "pdf",
    size: "275 KB",
    tags: ["news", "media"],
    criteria: ["publicity"],
    uploadDate: "2025-05-07",
    category: "doc-7" // Press Media
  },
  {
    id: "doc8",
    name: "Uncategorized_Document.pdf",
    type: "pdf",
    size: "180 KB",
    tags: ["misc"],
    criteria: [],
    uploadDate: "2025-05-08"
    // No category assigned
  }
];

export default function TestDocumentSorting() {
  const [documents, setDocuments] = useState(sampleDocuments);
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Document Sorting Test</h1>
      <p className="mb-8 text-gray-600">
        This page demonstrates the document sorting functionality. Click the "Sort Documents" button to open the document sorter modal.
      </p>
      
      <DocumentUploader 
        documents={documents}
        onDocumentsChange={setDocuments}
      />
    </div>
  );
}
`;

fs.writeFileSync(testPagePath, testPageContent);

// Create a temporary App.tsx file that renders the test page
const appPath = path.join('src', 'App.tsx');
const hasOriginalApp = fs.existsSync(appPath);

// Backup the original App.tsx if it exists
if (hasOriginalApp) {
  console.log('Backing up original App.tsx...');
  fs.copyFileSync(appPath, `${appPath}.backup`);
}

// Create a temporary App.tsx that imports and renders the test page
console.log('Creating temporary App.tsx with test page...');
const appContent = `import React from 'react';
import TestDocumentSorting from './pages/TestDocumentSorting';

function App() {
  return (
    <div className="App">
      <TestDocumentSorting />
    </div>
  );
}

export default App;
`;

fs.writeFileSync(appPath, appContent);

// Run the development server
console.log('Starting development server...');
console.log('Press Ctrl+C to stop the server and restore the original App.tsx');

try {
  // Determine which command to run based on the package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let startCommand = 'npm start';
  if (packageJson.scripts) {
    if (packageJson.scripts.dev) {
      startCommand = 'npm run dev';
    } else if (packageJson.scripts.serve) {
      startCommand = 'npm run serve';
    }
  }
  
  // Run the development server
  execSync(startCommand, { stdio: 'inherit' });
} catch (error) {
  // This will be reached when the user presses Ctrl+C
  console.log('\nStopping server...');
} finally {
  // Restore the original App.tsx
  if (hasOriginalApp) {
    console.log('Restoring original App.tsx...');
    fs.copyFileSync(`${appPath}.backup`, appPath);
    fs.unlinkSync(`${appPath}.backup`);
  }
  
  // Remove the test page
  console.log('Removing temporary test page...');
  if (fs.existsSync(testPagePath)) {
    fs.unlinkSync(testPagePath);
  }
  
  console.log('Done! Original files restored.');
}
