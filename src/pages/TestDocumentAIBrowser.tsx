import React, { useState } from 'react';
import { CriteriaDocumentUploaderWithMockAI } from '@/components/CriteriaDocumentUploaderWithMockAIBrowser';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  file?: File;
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  extracted_text?: string;
  summary?: string;
  ai_tags?: string[];
  file_url?: string;
  processing?: boolean;
  processing_error?: string;
}

export default function TestDocumentAI() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleAddDocument = (document: Document) => {
    setDocuments([...documents, document]);
  };

  const handleUpdateDocument = (updatedDocument: Document) => {
    setDocuments(documents.map(doc => 
      doc.id === updatedDocument.id ? updatedDocument : doc
    ));
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Document AI Integration Test</h1>
        <p className="text-gray-600 mb-4">
          This page demonstrates the Document AI integration using mock services.
          You can upload documents and see how they are processed by the Document AI service.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">How it works</h2>
          <ol className="list-decimal list-inside text-blue-700 space-y-2">
            <li>Upload a document using the form below</li>
            <li>The document is processed by the mock Document AI service</li>
            <li>The extracted text, summary, and tags are displayed</li>
            <li>In a real application, this would use Google Cloud Document AI and OpenAI</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CriteriaDocumentUploaderWithMockAI
          criterionId="test-criterion"
          criterionTitle="Test Criterion"
          documents={documents}
          onDocumentsChange={setDocuments}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Document AI Integration Details</h2>
        <p className="mb-4">
          The Document AI integration uses the following components:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>mockDocumentAIServiceBrowser</strong>: Browser-compatible mock implementation of Google Cloud Document AI</li>
          <li><strong>mockDocumentProcessingServiceWithAIBrowser</strong>: Browser-compatible mock service for processing documents</li>
          <li><strong>CriteriaDocumentUploaderWithMockAIBrowser</strong>: UI component for uploading and displaying documents</li>
        </ul>
        <p className="mb-4">
          In a production environment, these mock services would be replaced with real implementations
          that use Google Cloud Document AI and OpenAI APIs.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Implementation Notes</h3>
          <p className="text-yellow-700">
            To implement this in a production environment, you would need to:
          </p>
          <ol className="list-decimal list-inside text-yellow-700 space-y-2 mt-2">
            <li>Set up a Google Cloud project with Document AI enabled</li>
            <li>Create a Document AI processor for text extraction</li>
            <li>Set up an OpenAI API key for generating summaries and tags</li>
            <li>Configure the environment variables in .env.document-ai</li>
            <li>Deploy the application with the Document AI environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
