import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Tag,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  FolderDot,
  MoveHorizontal,
  Settings,
  Save,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { aiService, AICriteriaAnalysis } from "../services/aiService";
import { EnhancedDocumentSorter } from "./EnhancedDocumentSorter";

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  tags: string[];
  criteria: string[];
  uploadDate: string;
  preview?: string;
  category?: string;
}

interface DocumentCategory {
  id: string;
  title: string;
  icon: string;
}

interface DocumentUploaderProps {
  onUpload?: (files: File[]) => void;
  onTagDocument?: (documentId: string, tags: string[]) => void;
  onAssignCriteria?: (documentId: string, criteria: string[]) => void;
  documents?: Document[];
  visaCriteria?: string[];
  onDocumentsChange?: (documents: Document[]) => void;
  visaType?: string;
}

export function DocumentUploader({
  onUpload = () => {},
  onTagDocument = () => {},
  onAssignCriteria = () => {},
  documents = [],
  visaCriteria = [],
  onDocumentsChange,
  visaType = "O-1A",
}: DocumentUploaderProps) {
  const [documentsState, setDocumentsState] = useState<Document[]>(documents);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  
  // Document categories
  const documentCategories: DocumentCategory[] = [
    { id: "resume", title: "1 - Resume", icon: "user" },
    { id: "degree", title: "2 - Degree & Diplomas", icon: "graduation-cap" },
    { id: "license", title: "3 - License & Membership", icon: "id-card" },
    { id: "employment", title: "4 - Employment Records", icon: "briefcase" },
    { id: "support", title: "5 - Support Letters", icon: "envelope" },
    { id: "recognition", title: "6 - Recognitions", icon: "award" },
    { id: "media", title: "7 - Press Media", icon: "newspaper" }
  ];
  
  // Update local state when documents prop changes
  useEffect(() => {
    setDocumentsState(documents);
  }, [documents]);
  
  // Notify parent component when documents change
  const updateDocuments = (newDocuments: Document[]) => {
    setDocumentsState(newDocuments);
    if (onDocumentsChange) {
      onDocumentsChange(newDocuments);
    }
  };

  return (
    <div className="w-full bg-background p-8 rounded-lg border">
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center gap-6">
          <h2 className="text-xl font-semibold">Document Management</h2>
          <div className="flex space-x-6">
            <Input
              placeholder="Search documents..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" onClick={() => setIsSorterOpen(true)}>
              <FolderDot className="h-4 w-4 mr-2" />
              Sort Documents
            </Button>
            <Button variant="outline">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analyze Coverage
            </Button>
          </div>
        </div>
        
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed rounded-lg p-12 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('border-primary');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-primary');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-primary');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const files = Array.from(e.dataTransfer.files);
              
              // Create new document objects
              const newDocs = files.map((file, index) => {
                const id = crypto.randomUUID(); // Use standard UUID format
                const sizeInKB = Math.round(file.size / 1024);
                const sizeStr = sizeInKB < 1024 
                  ? `${sizeInKB} KB` 
                  : `${(sizeInKB / 1024).toFixed(1)} MB`;
                
                return {
                  id,
                  name: file.name,
                  size: sizeStr,
                  type: file.type,
                  tags: [],
                  criteria: [],
                  uploadDate: new Date().toISOString().split('T')[0],
                };
              });
              
              // Check for duplicates and only add new files
              const updatedDocs = [...documentsState];
              
              // Filter out duplicates based on file name
              newDocs.forEach(newDoc => {
                // Check if a document with the same name already exists
                const isDuplicate = updatedDocs.some(existingDoc => 
                  existingDoc.name === newDoc.name
                );
                
                // Only add if it's not a duplicate
                if (!isDuplicate) {
                  updatedDocs.push(newDoc);
                }
              });
              
              updateDocuments(updatedDocs);
              
              // Simulate upload progress
              setIsUploading(true);
              setUploadProgress(0);
              setUploadComplete(false);
              
              // Simulate upload progress with intervals
              let progress = 0;
              const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                  progress = 100;
                  clearInterval(interval);
                  
                  // Call onUpload callback
                  onUpload(files);
                  
                  // Show completion
                  setUploadComplete(true);
                  setTimeout(() => {
                    setIsUploading(false);
                  }, 2000);
                }
                setUploadProgress(progress);
              }, 500);
            }
          }}
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Drag and drop files here</h3>
              <p className="text-sm text-muted-foreground mt-2">
                or click to browse your files
              </p>
            </div>
            <Button variant="outline" className="relative">
              Browse Files
              <Input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const files = Array.from(e.target.files);
                    
                    // Create new document objects
                    const newDocs = files.map((file, index) => {
                      const id = crypto.randomUUID(); // Use standard UUID format
                      const sizeInKB = Math.round(file.size / 1024);
                      const sizeStr = sizeInKB < 1024 
                        ? `${sizeInKB} KB` 
                        : `${(sizeInKB / 1024).toFixed(1)} MB`;
                      
                      return {
                        id,
                        name: file.name,
                        size: sizeStr,
                        type: file.type,
                        tags: [],
                        criteria: [],
                        uploadDate: new Date().toISOString().split('T')[0],
                      };
                    });
                    
                    // Check for duplicates and only add new files
                    const updatedDocs = [...documentsState];
                    
                    // Filter out duplicates based on file name
                    newDocs.forEach(newDoc => {
                      // Check if a document with the same name already exists
                      const isDuplicate = updatedDocs.some(existingDoc => 
                        existingDoc.name === newDoc.name
                      );
                      
                      // Only add if it's not a duplicate
                      if (!isDuplicate) {
                        updatedDocs.push(newDoc);
                      }
                    });
                    
                    updateDocuments(updatedDocs);
                    
                    // Reset the file input
                    e.target.value = '';
                    
                    // Simulate upload progress
                    setIsUploading(true);
                    setUploadProgress(0);
                    setUploadComplete(false);
                    
                    // Simulate upload progress with intervals
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += Math.random() * 15;
                      if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        
                        // Call onUpload callback
                        onUpload(files);
                        
                        // Show completion
                        setUploadComplete(true);
                        setTimeout(() => {
                          setIsUploading(false);
                        }, 2000);
                      }
                      setUploadProgress(progress);
                    }, 500);
                  }
                }}
              />
            </Button>
          </div>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {uploadComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                )}
                <span className="font-medium">
                  {uploadComplete ? "Upload Complete!" : "Uploading documents..."}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {/* Document List */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Documents ({documentsState.length})
            </TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="tagged">Tagged</TabsTrigger>
            <TabsTrigger value="untagged">Untagged</TabsTrigger>
            <TabsTrigger value="coverage">Criteria Coverage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <ScrollArea className="h-[400px] pr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {documentsState.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-32 bg-muted">
                      {doc.preview ? (
                        <img
                          src={doc.preview}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4
                            className="font-medium text-sm truncate"
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {doc.uploadDate}
                            {doc.category && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="text-blue-500">
                                  {documentCategories.find(c => c.id === doc.category)?.title || doc.category}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {doc.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="by-category" className="space-y-6">
            <ScrollArea className="h-[400px] pr-6">
              <div className="space-y-8">
                {/* Group documents by category */}
                {documentCategories.map((category) => {
                  const categoryDocs = documentsState.filter(doc => doc.category === category.id);
                  if (categoryDocs.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center">
                        <FolderDot className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium">{category.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {categoryDocs.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryDocs.map((doc) => (
                          <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-24 bg-muted">
                              {doc.preview ? (
                                <img
                                  src={doc.preview}
                                  alt={doc.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4
                                    className="font-medium text-sm truncate"
                                    title={doc.name}
                                  >
                                    {doc.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.size} • {doc.uploadDate}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Uncategorized documents */}
                {(() => {
                  const uncategorizedDocs = documentsState.filter(doc => !doc.category);
                  if (uncategorizedDocs.length === 0) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FolderDot className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium">Uncategorized</h3>
                        <Badge variant="outline" className="ml-2">
                          {uncategorizedDocs.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uncategorizedDocs.map((doc) => (
                          <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-24 bg-muted">
                              {doc.preview ? (
                                <img
                                  src={doc.preview}
                                  alt={doc.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4
                                    className="font-medium text-sm truncate"
                                    title={doc.name}
                                  >
                                    {doc.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.size} • {doc.uploadDate}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                {/* No documents message */}
                {documentsState.length === 0 && (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground">No documents found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload documents to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="tagged">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Tagged documents will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="untagged">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Untagged documents will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="coverage">
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center space-y-4">
                <BarChart2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No criteria analysis available. Click "Analyze Coverage"
                  to begin.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Enhanced Document Sorter Modal */}
      <EnhancedDocumentSorter
        isOpen={isSorterOpen}
        onClose={() => setIsSorterOpen(false)}
        documents={documentsState.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadDate: doc.uploadDate,
          category: doc.category
        }))}
        categories={documentCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          icon: cat.icon
        }))}
        onSaveCategories={(sortedDocuments) => {
          // Map the sorted documents back to our Document type
          const updatedDocuments = documentsState.map(doc => {
            // Find the corresponding document in sortedDocuments
            const sortedDoc = sortedDocuments.find(sorted => sorted.id === doc.id);
            if (sortedDoc) {
              // Update the category
              return {
                ...doc,
                category: sortedDoc.category
              };
            }
            return doc;
          });
          
          updateDocuments(updatedDocuments);
          setIsSorterOpen(false);
        }}
      />
    </div>
  );
}
