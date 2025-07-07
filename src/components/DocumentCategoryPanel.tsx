import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DocumentCategorySorter } from "./DocumentCategorySorter";
import {
  FileText,
  FolderDot,
  MoveHorizontal,
  FolderOpen,
  PlusCircle,
  Upload,
  Settings,
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

interface DocumentCategoryPanelProps {
  documents: Document[];
  categories: Category[];
  onUpdateDocuments: (documents: Document[]) => void;
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
  onUploadDocument?: () => void;
}

export function DocumentCategoryPanel({
  documents,
  categories,
  onUpdateDocuments,
  onSelectCategory,
  selectedCategory = "all",
  onUploadDocument,
}: DocumentCategoryPanelProps) {
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);
  const [documentsByCategory, setDocumentsByCategory] = useState<{ [key: string]: Document[] }>({});

  // Count documents by category
  useEffect(() => {
    const countByCategory: { [key: string]: Document[] } = {};
    
    // Initialize all categories with empty arrays
    categories.forEach(category => {
      countByCategory[category.id] = [];
    });
    
    // Add documents to their categories
    documents.forEach(doc => {
      const category = doc.category || "uncategorized";
      if (countByCategory[category]) {
        countByCategory[category].push(doc);
      } else if (category === "uncategorized") {
        // Handle uncategorized documents
        if (!countByCategory["uncategorized"]) {
          countByCategory["uncategorized"] = [];
        }
        countByCategory["uncategorized"].push(doc);
      }
    });
    
    setDocumentsByCategory(countByCategory);
  }, [documents, categories]);

  // Handle document drag start
  const handleDragStart = (document: Document, e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedDocument(document);
    
    // Set drag image (optional)
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', document.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  // Handle document drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedDocument(null);
  };

  // Handle dropping a document into a category
  const handleDrop = (categoryId: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedDocument) return;
    
    // Update the document's category
    const updatedDocuments = documents.map(doc => {
      if (doc.id === draggedDocument.id) {
        return { ...doc, category: categoryId };
      }
      return doc;
    });
    
    // Update the parent component
    onUpdateDocuments(updatedDocuments);
    
    // Reset drag state
    setIsDragging(false);
    setDraggedDocument(null);
  };

  // Handle saving categories from the sorter modal
  const handleSaveCategories = (sortedDocuments: Document[]) => {
    onUpdateDocuments(sortedDocuments);
  };

  // Get the count of documents in each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") {
      return documents.length;
    }
    return documentsByCategory[categoryId]?.length || 0;
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  // Get category icon
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'user':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'graduation-cap':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'id-card':
        return <FileText className="h-4 w-4 text-teal-500" />;
      case 'briefcase':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'envelope':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'award':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'newspaper':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FolderDot className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Document Categories</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSorterOpen(true)}
            title="Sort Documents"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {onUploadDocument && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUploadDocument}
              title="Upload Document"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* All Documents category */}
          <div 
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
              selectedCategory === "all" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => onSelectCategory && onSelectCategory("all")}
          >
            <div className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" />
              <span>All Documents</span>
            </div>
            <Badge variant="outline">{documents.length}</Badge>
          </div>
          
          {/* Document categories */}
          <div className="mt-4 space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedCategory === category.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                }`}
                onClick={() => onSelectCategory && onSelectCategory(category.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isDragging) {
                    e.currentTarget.classList.add('bg-blue-50');
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-50');
                }}
                onDrop={(e) => handleDrop(category.id, e)}
              >
                <div className="flex items-center">
                  {getCategoryIcon(category.icon)}
                  <span className="ml-2">{category.title}</span>
                </div>
                <Badge variant="outline">{getCategoryCount(category.id)}</Badge>
              </div>
            ))}
          </div>
          
          {/* Document list for the selected category */}
          {selectedCategory !== "all" && documentsByCategory[selectedCategory] && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Documents in this category</h3>
              <div className="space-y-1">
                {documentsByCategory[selectedCategory].map((doc) => (
                  <div
                    key={doc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(doc, e)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-move"
                  >
                    {getDocumentIcon(doc.type)}
                    <span className="ml-2 text-sm truncate">{doc.name}</span>
                    <MoveHorizontal className="h-3 w-3 text-gray-400 ml-auto" />
                  </div>
                ))}
                {documentsByCategory[selectedCategory].length === 0 && (
                  <div className="text-sm text-gray-500 p-2">
                    No documents in this category
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Document Category Sorter Modal */}
      <DocumentCategorySorter
        isOpen={isSorterOpen}
        onClose={() => setIsSorterOpen(false)}
        documents={documents}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
}
