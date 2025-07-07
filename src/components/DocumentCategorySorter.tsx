import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderDot,
  Save,
  MoveHorizontal,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size?: string;
  uploadDate?: string;
  category?: string;
}

interface Category {
  id: string;
  title: string;
  icon?: string;
  count?: number;
}

interface DocumentCategorySorterProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  categories: Category[];
  onSaveCategories: (documents: Document[]) => void;
}

export function DocumentCategorySorter({
  isOpen,
  onClose,
  documents,
  categories,
  onSaveCategories,
}: DocumentCategorySorterProps) {
  const [sortedDocuments, setSortedDocuments] = useState<{ [key: string]: Document[] }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    setHasChanges(false);
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
    setHasChanges(true);
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

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sort Documents into Categories</DialogTitle>
          <DialogDescription>
            Organize your documents by dragging and dropping them into the appropriate categories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="text-sm text-gray-500 mb-4">
            Drag and drop documents between categories to organize them.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-auto p-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`border rounded-lg p-4 flex flex-col h-[300px] ${
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FolderDot className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">{category.title}</h3>
                  </div>
                  <Badge variant="outline">
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
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {doc.name}
                          </div>
                          {doc.size && (
                            <div className="text-xs text-gray-500">
                              {doc.size} • {doc.uploadDate || 'Unknown date'}
                            </div>
                          )}
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
              className={`border rounded-lg p-4 flex flex-col h-[300px] ${
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FolderDot className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Uncategorized</h3>
                </div>
                <Badge variant="outline">
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
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {doc.name}
                        </div>
                        {doc.size && (
                          <div className="text-xs text-gray-500">
                            {doc.size} • {doc.uploadDate || 'Unknown date'}
                          </div>
                        )}
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
        </div>
        
        <DialogFooter className="mt-4">
          {hasChanges && (
            <div className="mr-auto text-sm text-amber-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              You have unsaved changes
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Categories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
