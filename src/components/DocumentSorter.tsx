import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Folder,
  FolderOpen,
  MoveHorizontal,
  Paperclip,
  Tag,
} from "lucide-react";
import { documentProcessingService } from "@/services/documentProcessingService";
import { supabase } from "@/lib/supabase";

interface Document {
  id: string;
  name: string;
  title?: string;
  description?: string;
  type: string;
  tags?: string[];
  criteria?: string[];
  category?: string;
  originalDoc?: any;
  summary?: string;
  extracted_text?: string;
  ai_tags?: string[];
  file_url?: string;
}

interface DocumentCategory {
  id: string;
  title: string;
  icon: string;
}

interface DocumentSorterProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  categories: DocumentCategory[];
  onSaveCategories: (sortedDocuments: Document[]) => void;
  caseId?: string;
}

export function DocumentSorter({
  isOpen,
  onClose,
  documents,
  categories,
  onSaveCategories,
  caseId,
}: DocumentSorterProps) {
  // State to track documents in each category
  const [sortedDocuments, setSortedDocuments] = useState<{ [key: string]: Document[] }>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);
  const [uploadingDocuments, setUploadingDocuments] = useState<boolean>(false);
  const [processingDocuments, setProcessingDocuments] = useState<string[]>([]);

  // Initialize sorted documents when component mounts or documents change
  useEffect(() => {
    const sorted: { [key: string]: Document[] } = {};
    
    // Initialize categories
    categories.forEach(category => {
      sorted[category.id] = [];
    });
    
    // Add an "uncategorized" category for documents without a category
    sorted["uncategorized"] = [];
    
    // Sort documents into categories
    documents.forEach(doc => {
      const category = doc.category || "uncategorized";
      if (sorted[category]) {
        sorted[category].push(doc);
      } else {
        sorted["uncategorized"].push(doc);
      }
    });
    
    setSortedDocuments(sorted);
  }, [documents, categories]);

  // Handle document drag start
  const handleDragStart = (document: Document) => {
    setIsDragging(true);
    setDraggedDocument(document);
  };

  // Handle document drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedDocument(null);
  };

  // Handle dropping a document into a category
  const handleDrop = (categoryId: string) => {
    if (!draggedDocument) return;
    
    // Find the current category of the document
    let currentCategory = "uncategorized";
    Object.keys(sortedDocuments).forEach(catId => {
      if (sortedDocuments[catId].some(doc => doc.id === draggedDocument?.id)) {
        currentCategory = catId;
      }
    });
    
    // If the document is already in this category, do nothing
    if (currentCategory === categoryId) {
      setIsDragging(false);
      setDraggedDocument(null);
      return;
    }
    
    // Update the sorted documents
    const updatedSorted = { ...sortedDocuments };
    
    // Remove the document from its current category
    updatedSorted[currentCategory] = updatedSorted[currentCategory].filter(
      doc => doc.id !== draggedDocument.id
    );
    
    // Add the document to the new category with updated category property
    const updatedDocument = { ...draggedDocument, category: categoryId };
    updatedSorted[categoryId] = [...updatedSorted[categoryId], updatedDocument];
    
    setSortedDocuments(updatedSorted);
    setIsDragging(false);
    setDraggedDocument(null);
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !caseId) return;
    
    setUploadingDocuments(true);
    
    try {
      const files = Array.from(event.target.files);
      const uploadedDocs: Document[] = [];
      
      for (const file of files) {
        // Upload and process the document
        const result = await documentProcessingService.uploadAndProcessDocument(
          file,
          "documents",
          "document"
        );
        
        if (result.success) {
          const newDoc: Document = {
            id: crypto.randomUUID(),
            name: file.name,
            title: file.name,
            description: result.summary || "",
            type: "document",
            tags: result.tags || [],
            category: "uncategorized", // Start in uncategorized
            file_url: result.publicUrl,
            summary: result.summary,
            extracted_text: result.extractedText,
            ai_tags: result.tags,
          };
          
          uploadedDocs.push(newDoc);
          
          // Add to uncategorized category
          setSortedDocuments(prev => ({
            ...prev,
            uncategorized: [...prev.uncategorized, newDoc]
          }));
        }
      }
      
      // Reset the file input
      event.target.value = "";
      
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Save the categorized documents
  const handleSave = () => {
    // Flatten the sorted documents into a single array
    const allDocuments: Document[] = [];
    Object.keys(sortedDocuments).forEach(categoryId => {
      sortedDocuments[categoryId].forEach(doc => {
        allDocuments.push({
          ...doc,
          category: categoryId === "uncategorized" ? undefined : categoryId
        });
      });
    });
    
    onSaveCategories(allDocuments);
    onClose();
  };

  // Get the appropriate icon for a document type
  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resume':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'degree':
      case 'diploma':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'license':
      case 'membership':
        return <Paperclip className="h-5 w-5 text-teal-500" />;
      case 'employment':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'letter':
      case 'support':
      case 'recommendation':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'recognition':
      case 'award':
      case 'certificate':
        return <Tag className="h-5 w-5 text-yellow-500" />;
      case 'press':
      case 'media':
      case 'news':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'patent':
        return <Paperclip className="h-5 w-5 text-green-500" />;
      case 'publication':
      case 'paper':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'presentation':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get the category icon
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'user':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'graduation-cap':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'id-card':
        return <Paperclip className="h-5 w-5 text-teal-500" />;
      case 'briefcase':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'envelope':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'award':
        return <Tag className="h-5 w-5 text-yellow-500" />;
      case 'newspaper':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <Folder className="h-5 w-5 text-gray-500" />;
    }
  };

  // Count total documents
  const totalDocuments = Object.values(sortedDocuments).reduce(
    (total, docs) => total + docs.length,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Document Sorter</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              {totalDocuments} documents total
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={uploadingDocuments}>
                <label className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingDocuments}
                  />
                </label>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(sortedDocuments).flat().map((doc) => (
                    <Card 
                      key={doc.id}
                      draggable
                      onDragStart={() => handleDragStart(doc)}
                      onDragEnd={handleDragEnd}
                      className={`overflow-hidden hover:shadow-md transition-shadow cursor-move ${
                        draggedDocument?.id === doc.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {getDocumentTypeIcon(doc.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-md font-medium mb-1">{doc.title || doc.name}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {doc.description || doc.summary || "No description available"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <span className="font-medium mr-1">Category:</span>
                              <span>
                                {doc.category && doc.category !== "uncategorized"
                                  ? categories.find(c => c.id === doc.category)?.title || doc.category
                                  : "Uncategorized"}
                              </span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{doc.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="categories" className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[60vh]">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`border rounded-lg p-4 flex flex-col h-full ${
                      isDragging ? 'border-dashed border-2' : ''
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (isDragging) {
                        e.currentTarget.classList.add('border-primary');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                      handleDrop(category.id);
                    }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="mr-2">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <h3 className="font-medium">{category.title}</h3>
                      <Badge variant="outline" className="ml-2">
                        {sortedDocuments[category.id]?.length || 0}
                      </Badge>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="space-y-2">
                        {sortedDocuments[category.id]?.map((doc) => (
                          <div
                            key={doc.id}
                            draggable
                            onDragStart={() => handleDragStart(doc)}
                            onDragEnd={handleDragEnd}
                            className={`p-2 border rounded flex items-start cursor-move hover:bg-gray-50 ${
                              draggedDocument?.id === doc.id ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="mr-2 mt-1">
                              {getDocumentTypeIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {doc.title || doc.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {doc.description || doc.summary || "No description"}
                              </div>
                            </div>
                            <MoveHorizontal className="h-4 w-4 text-gray-400 ml-1 flex-shrink-0" />
                          </div>
                        ))}
                        {(!sortedDocuments[category.id] || sortedDocuments[category.id].length === 0) && (
                          <div className="text-center p-4 text-sm text-gray-500">
                            Drag documents here
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
                
                {/* Uncategorized section */}
                <div
                  className={`border rounded-lg p-4 flex flex-col h-full ${
                    isDragging ? 'border-dashed border-2' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (isDragging) {
                      e.currentTarget.classList.add('border-primary');
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary');
                    handleDrop("uncategorized");
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="mr-2">
                      <Folder className="h-5 w-5 text-gray-500" />
                    </div>
                    <h3 className="font-medium">Uncategorized</h3>
                    <Badge variant="outline" className="ml-2">
                      {sortedDocuments["uncategorized"]?.length || 0}
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2">
                      {sortedDocuments["uncategorized"]?.map((doc) => (
                        <div
                          key={doc.id}
                          draggable
                          onDragStart={() => handleDragStart(doc)}
                          onDragEnd={handleDragEnd}
                          className={`p-2 border rounded flex items-start cursor-move hover:bg-gray-50 ${
                            draggedDocument?.id === doc.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="mr-2 mt-1">
                            {getDocumentTypeIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {doc.title || doc.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {doc.description || doc.summary || "No description"}
                            </div>
                          </div>
                          <MoveHorizontal className="h-4 w-4 text-gray-400 ml-1 flex-shrink-0" />
                        </div>
                      ))}
                      {(!sortedDocuments["uncategorized"] || sortedDocuments["uncategorized"].length === 0) && (
                        <div className="text-center p-4 text-sm text-gray-500">
                          No uncategorized documents
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Categories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
