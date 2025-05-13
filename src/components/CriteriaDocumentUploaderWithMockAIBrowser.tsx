import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Tag,
  PlusCircle,
  Edit,
  Trash2,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { mockDocumentProcessingServiceWithAI } from "@/services/mockDocumentProcessingServiceWithAIBrowser";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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

interface CriteriaDocumentUploaderProps {
  criterionId: string;
  criterionTitle: string;
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  onAddDocument: (document: Document) => void;
  onUpdateDocument: (document: Document) => void;
  onDeleteDocument: (documentId: string) => void;
}

export function CriteriaDocumentUploaderWithMockAI({
  criterionId,
  criterionTitle,
  documents = [],
  onDocumentsChange,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}: CriteriaDocumentUploaderProps) {
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [processingDocuments, setProcessingDocuments] = useState<string[]>([]);
  
  // New document form state
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentDescription, setNewDocumentDescription] = useState("");
  const [newDocumentType, setNewDocumentType] = useState("support");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const toggleDetails = (id: string) => {
    if (expandedDetails.includes(id)) {
      setExpandedDetails(expandedDetails.filter(item => item !== id));
    } else {
      setExpandedDetails([...expandedDetails, id]);
    }
  };
  
  const handleAddDocument = async () => {
    if (!newDocumentTitle.trim()) {
      alert("Please enter a document title");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title: newDocumentTitle,
        description: newDocumentDescription,
        type: newDocumentType,
        uploadDate: new Date().toISOString().split('T')[0],
        processing: true
      };
      
      if (newDocumentFile) {
        newDocument.file = newDocumentFile;
        newDocument.fileName = newDocumentFile.name;
        
        const sizeInKB = Math.round(newDocumentFile.size / 1024);
        newDocument.fileSize = sizeInKB < 1024 
          ? `${sizeInKB} KB` 
          : `${(sizeInKB / 1024).toFixed(1)} MB`;
        
        // For mock purposes, we'll just set a fake file URL
        newDocument.file_url = `https://example.com/mock-documents/${newDocument.id}/${newDocumentFile.name}`;
      }
      
      // Add the document to the list
      onAddDocument(newDocument);
      
      // Reset form
      setNewDocumentTitle("");
      setNewDocumentDescription("");
      setNewDocumentType("support");
      setNewDocumentFile(null);
      setIsAddDialogOpen(false);
      
      // Process the document with mock Document AI
      setProcessingDocuments(prev => [...prev, newDocument.id]);
      
      // Process the document with mock Document AI
      const processedDoc = await mockDocumentProcessingServiceWithAI.processDocument(
        newDocument.id,
        newDocument.file_url || "",
        newDocument.type,
        newDocument.fileName || newDocument.title
      );
      
      if (processedDoc) {
        // Update the document with the processed data
        onUpdateDocument({
          ...newDocument,
          extracted_text: processedDoc.extracted_text,
          summary: processedDoc.summary,
          ai_tags: processedDoc.ai_tags,
          processing: false
        });
      } else {
        // Update the document with an error
        onUpdateDocument({
          ...newDocument,
          processing: false,
          processing_error: "Failed to process document"
        });
      }
      
      setProcessingDocuments(prev => prev.filter(id => id !== newDocument.id));
    } catch (error) {
      console.error("Error adding document:", error);
      alert(`Error adding document: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleEditDocument = async () => {
    if (!editingDocument || !editingDocument.title.trim()) {
      alert("Please enter a document title");
      return;
    }
    
    setIsUploading(true);
    
    try {
      let updatedDocument = { ...editingDocument };
      
      // If a new file was uploaded, update the file URL
      if (editingDocument.file && editingDocument.file !== documents.find(d => d.id === editingDocument.id)?.file) {
        // For mock purposes, we'll just set a fake file URL
        updatedDocument.file_url = `https://example.com/mock-documents/${updatedDocument.id}/${editingDocument.file.name}`;
        updatedDocument.processing = true;
      }
      
      // Update the document
      onUpdateDocument(updatedDocument);
      setEditingDocument(null);
      setIsEditDialogOpen(false);
      
      // Process the document if the file was changed
      if (updatedDocument.processing) {
        setProcessingDocuments(prev => [...prev, updatedDocument.id]);
        
        // Process the document with mock Document AI
        const processedDoc = await mockDocumentProcessingServiceWithAI.processDocument(
          updatedDocument.id,
          updatedDocument.file_url || "",
          updatedDocument.type,
          updatedDocument.fileName || updatedDocument.title
        );
        
        if (processedDoc) {
          // Update the document with the processed data
          onUpdateDocument({
            ...updatedDocument,
            extracted_text: processedDoc.extracted_text,
            summary: processedDoc.summary,
            ai_tags: processedDoc.ai_tags,
            processing: false
          });
        } else {
          // Update the document with an error
          onUpdateDocument({
            ...updatedDocument,
            processing: false,
            processing_error: "Failed to process document"
          });
        }
        
        setProcessingDocuments(prev => prev.filter(id => id !== updatedDocument.id));
      }
    } catch (error) {
      console.error("Error updating document:", error);
      alert(`Error updating document: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const openEditDialog = (document: Document) => {
    setEditingDocument({...document});
    setIsEditDialogOpen(true);
  };
  
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'degree':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'license':
        return <Paperclip className="h-5 w-5 text-teal-500" />;
      case 'employment':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'support':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'recognition':
        return <Tag className="h-5 w-5 text-yellow-500" />;
      case 'press':
        return <FileText className="h-5 w-5 text-orange-500" />;
      // Keep backward compatibility with old document types
      case 'letter':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'patent':
        return <Paperclip className="h-5 w-5 text-green-500" />;
      case 'award':
        return <Tag className="h-5 w-5 text-yellow-500" />;
      case 'publication':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'presentation':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{criterionTitle}</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        <span className="font-medium">{documents.length} {documents.length === 1 ? 'exhibit' : 'exhibits'}</span>
      </div>

      <div className="space-y-6">
        {documents.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-gray-100">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">No documents added yet</p>
                <Button 
                  variant="link" 
                  className="text-sm p-0 h-auto mt-1"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first document
                </Button>
              </div>
            </div>
          </div>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="border rounded-lg p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getDocumentTypeIcon(document.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-md font-medium mb-2">{document.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {document.description}
                  </p>
                  {expandedDetails.includes(document.id) && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm">
                      {document.fileName && (
                        <div className="flex items-center mb-2">
                          <span className="font-medium mr-2">File:</span>
                          <span>{document.fileName} ({document.fileSize})</span>
                        </div>
                      )}
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-2">Added:</span>
                        <span>{document.uploadDate}</span>
                      </div>
                      
                      {/* Document Processing Status */}
                      {processingDocuments.includes(document.id) || document.processing ? (
                        <div className="mt-3 border-t pt-3">
                          <div className="flex items-center text-blue-600">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Processing document with AI...</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Document Processing Results */}
                          {document.summary && (
                            <div className="mt-3 border-t pt-3">
                              <div className="font-medium mb-1">AI Summary:</div>
                              <div className="text-gray-700 mb-3">{document.summary}</div>
                            </div>
                          )}
                          
                          {document.ai_tags && document.ai_tags.length > 0 && (
                            <div className="mb-3">
                              <div className="font-medium mb-1">AI Tags:</div>
                              <div className="flex flex-wrap gap-1">
                                {document.ai_tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {document.extracted_text && (
                            <div className="mb-2">
                              <div className="font-medium mb-1">Extracted Text:</div>
                              <div className="bg-white p-2 rounded border text-xs max-h-32 overflow-y-auto">
                                {document.extracted_text.substring(0, 500)}
                                {document.extracted_text.length > 500 && '...'}
                              </div>
                            </div>
                          )}
                          
                          {document.processing_error && (
                            <div className="mt-3 border-t pt-3">
                              <div className="text-red-600 mb-2">
                                <span className="font-medium">Error:</span> {document.processing_error}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={async () => {
                                  setProcessingDocuments(prev => [...prev, document.id]);
                                  
                                  // Update the document to show it's processing
                                  onUpdateDocument({
                                    ...document,
                                    processing: true,
                                    processing_error: undefined
                                  });
                                  
                                  // Retry processing with mock Document AI
                                  const processedDoc = await mockDocumentProcessingServiceWithAI.processDocument(
                                    document.id,
                                    document.file_url || "",
                                    document.type,
                                    document.fileName || document.title
                                  );
                                  
                                  if (processedDoc) {
                                    // Update the document with the processed data
                                    onUpdateDocument({
                                      ...document,
                                      extracted_text: processedDoc.extracted_text,
                                      summary: processedDoc.summary,
                                      ai_tags: processedDoc.ai_tags,
                                      processing: false,
                                      processing_error: undefined
                                    });
                                  } else {
                                    // Update the document with an error
                                    onUpdateDocument({
                                      ...document,
                                      processing: false,
                                      processing_error: "Failed to process document"
                                    });
                                  }
                                  
                                  setProcessingDocuments(prev => prev.filter(id => id !== document.id));
                                }}
                              >
                                Retry Processing
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <button 
                    className="text-sm text-blue-600 flex items-center"
                    onClick={() => toggleDetails(document.id)}
                  >
                    {expandedDetails.includes(document.id) ? 'Hide details' : 'Show details'}
                    {expandedDetails.includes(document.id) ? (
                      <ChevronUp className="h-3 w-3 ml-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => openEditDialog(document)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onDeleteDocument(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Document to {criterionTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentType">Document Type</Label>
              <select
                id="documentType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newDocumentType}
                onChange={(e) => setNewDocumentType(e.target.value)}
              >
                <option value="resume">Resume</option>
                <option value="degree">Degree & Diplomas</option>
                <option value="license">License & Memberships</option>
                <option value="employment">Employment Records</option>
                <option value="support">Support Letters</option>
                <option value="recognition">Recognitions</option>
                <option value="press">Press Media</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentTitle">Title</Label>
              <Input
                id="documentTitle"
                placeholder="Enter document title"
                value={newDocumentTitle}
                onChange={(e) => setNewDocumentTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentDescription">Description</Label>
              <Textarea
                id="documentDescription"
                placeholder="Enter document description"
                value={newDocumentDescription}
                onChange={(e) => setNewDocumentDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentFile">Upload File (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Input
                  id="documentFile"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setNewDocumentFile(e.target.files[0]);
                    }
                  }}
                />
                <label 
                  htmlFor="documentFile" 
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {newDocumentFile ? newDocumentFile.name : 'Click to upload or drag and drop'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editDocumentType">Document Type</Label>
                <select
                  id="editDocumentType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingDocument.type}
                  onChange={(e) => setEditingDocument({...editingDocument, type: e.target.value})}
                >
                  <option value="resume">Resume</option>
                  <option value="degree">Degree & Diplomas</option>
                  <option value="license">License & Memberships</option>
                  <option value="employment">Employment Records</option>
                  <option value="support">Support Letters</option>
                  <option value="recognition">Recognitions</option>
                  <option value="press">Press Media</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDocumentTitle">Title</Label>
                <Input
                  id="editDocumentTitle"
                  placeholder="Enter document title"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({...editingDocument, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDocumentDescription">Description</Label>
                <Textarea
                  id="editDocumentDescription"
                  placeholder="Enter document description"
                  value={editingDocument.description}
                  onChange={(e) => setEditingDocument({...editingDocument, description: e.target.value})}
                  rows={3}
                />
              </div>
              {editingDocument.fileName && (
                <div className="text-sm text-gray-500">
                  Current file: {editingDocument.fileName} ({editingDocument.fileSize})
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="editDocumentFile">Replace File (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Input
                    id="editDocumentFile"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const sizeInKB = Math.round(file.size / 1024);
                        const fileSize = sizeInKB < 1024 
                          ? `${sizeInKB} KB` 
                          : `${(sizeInKB / 1024).toFixed(1)} MB`;
                        
                        setEditingDocument({
                          ...editingDocument, 
                          file,
                          fileName: file.name,
                          fileSize
                        });
                      }
                    }}
                  />
                  <label 
                    htmlFor="editDocumentFile" 
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload a new file
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleEditDocument} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
