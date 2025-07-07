import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Folder,
  FolderOpen,
  MoveHorizontal,
  Paperclip,
  Tag,
  Eye,
  FileSearch,
  AlertTriangle,
} from "lucide-react";

// Document interface
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
  confidence?: number; // OCR confidence score
}

// Category interface
interface Category {
  id: string;
  title: string;
  icon: string;
}

// Props interface
interface EnhancedDocumentSorterProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  categories: Category[];
  onSaveCategories: (sortedDocuments: Document[]) => void;
}

// Document preview modal component
const DocumentPreviewModal = ({ 
  document, 
  isOpen, 
  onClose 
}: { 
  document: Document | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSearch className="h-5 w-5 mr-2" />
            {document.title || document.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col space-y-4 p-4">
            {/* Document metadata */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
              <div>
                <p className="text-sm font-medium">Document Type</p>
                <p className="text-sm">{document.type || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm">{document.category || "Uncategorized"}</p>
              </div>
              {document.confidence !== undefined && (
                <div className="col-span-2">
                  <p className="text-sm font-medium">OCR Confidence</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          document.confidence > 0.8 
                            ? 'bg-green-500' 
                            : document.confidence > 0.6 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`} 
                        style={{ width: `${document.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{Math.round(document.confidence * 100)}%</span>
                  </div>
                  {document.confidence < 0.7 && (
                    <div className="flex items-center mt-1 text-amber-600 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Low quality scan may affect text extraction</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* AI Summary */}
            {document.summary && (
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">AI Summary</h3>
                <p className="text-sm text-muted-foreground">{document.summary}</p>
              </div>
            )}
            
            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Extracted Text */}
            <div className="border rounded-md p-4 flex-1">
              <h3 className="text-sm font-medium mb-2">Extracted Text</h3>
              <ScrollArea className="h-[300px]">
                <div className="text-sm whitespace-pre-line">
                  {document.extracted_text || "No text extracted from this document."}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Document card component
const DocumentCard = ({ 
  document, 
  onDragStart, 
  onClick 
}: { 
  document: Document; 
  onDragStart: () => void; 
  onClick: () => void;
}) => {
  // Set up draggable
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: document.id,
    data: document
  });
  // Get document icon based on type
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <Card 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="overflow-hidden hover:shadow-md transition-all cursor-move border-l-4 border-l-blue-500"
        style={{
          borderLeftColor: document.category 
            ? document.category === 'resume' 
              ? '#3b82f6' // blue
              : document.category === 'degree' 
              ? '#10b981' // green
              : document.category === 'license' 
              ? '#14b8a6' // teal
              : document.category === 'employment' 
              ? '#6366f1' // indigo
              : document.category === 'support' 
              ? '#a855f7' // purple
              : document.category === 'recognition' 
              ? '#eab308' // yellow
              : document.category === 'media' 
              ? '#f97316' // orange
              : '#d1d5db' // gray
            : '#d1d5db' // gray
        }}
      >
        <div className="p-3 flex items-start">
          <div className="mr-3 mt-1 flex-shrink-0">
            {getDocumentTypeIcon(document.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium mb-1 truncate">{document.title || document.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {document.summary || document.description || "No description available"}
            </p>
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    +{document.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0 h-6 w-6" 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Category dropzone component
const CategoryDropzone = ({ 
  category, 
  documents, 
  isOver,
  id
}: { 
  category: Category; 
  documents: Document[]; 
  isOver: boolean;
  id: string;
}) => {
  // Set up droppable
  const { setNodeRef } = useDroppable({
    id: id
  });
  // Get category icon
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

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={`border rounded-lg p-3 mb-3 transition-all ${
        isOver 
          ? 'border-primary border-dashed border-2 bg-primary/5' 
          : 'border-muted-foreground/20'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getCategoryIcon(category.icon)}
          <h3 className="text-sm font-medium ml-2">{category.title}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {documents.length}
        </Badge>
      </div>
      
      {documents.length === 0 && (
        <div className="text-center p-3 text-xs text-muted-foreground border border-dashed rounded-md">
          Drop documents here
        </div>
      )}
      
      {documents.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {documents.slice(0, 3).map((doc, index) => (
            <div key={doc.id} className="truncate py-1 border-b last:border-b-0">
              {doc.title || doc.name}
            </div>
          ))}
          {documents.length > 3 && (
            <div className="text-center mt-1 text-xs text-muted-foreground">
              +{documents.length - 3} more
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Main component
export function EnhancedDocumentSorter({
  isOpen,
  onClose,
  documents,
  categories,
  onSaveCategories,
}: EnhancedDocumentSorterProps) {
  // State for sorted documents
  const [sortedDocuments, setSortedDocuments] = useState<{ [key: string]: Document[] }>({});
  
  // State for active document being dragged
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  
  // State for document preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  
  // State for drag over category
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  
  // State for tracking changes
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Filter documents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => 
      (doc.title || doc.name).toLowerCase().includes(query) ||
      (doc.description || "").toLowerCase().includes(query) ||
      (doc.summary || "").toLowerCase().includes(query) ||
      (doc.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
    
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const documentId = active.id as string;
    
    // Find the document being dragged
    let draggedDoc: Document | undefined;
    Object.values(sortedDocuments).forEach(docs => {
      const found = docs.find(doc => doc.id === documentId);
      if (found) draggedDoc = found;
    });
    
    if (draggedDoc) {
      setActiveDocument(draggedDoc);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setDragOverCategory(over.id as string);
    } else {
      setDragOverCategory(null);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const documentId = active.id as string;
      const categoryId = over.id as string;
      
      // Find the document's current category
      let currentCategory = "uncategorized";
      Object.entries(sortedDocuments).forEach(([catId, docs]) => {
        if (docs.some(doc => doc.id === documentId)) {
          currentCategory = catId;
        }
      });
      
      // If the document is already in this category, do nothing
      if (currentCategory === categoryId) {
        setActiveDocument(null);
        setDragOverCategory(null);
        return;
      }
      
      // Update the sorted documents
      const updatedSorted = { ...sortedDocuments };
      
      // Find the document
      const docIndex = updatedSorted[currentCategory].findIndex(doc => doc.id === documentId);
      if (docIndex === -1) {
        setActiveDocument(null);
        setDragOverCategory(null);
        return;
      }
      
      // Remove the document from its current category
      const [movedDoc] = updatedSorted[currentCategory].splice(docIndex, 1);
      
      // Add the document to the new category with updated category property
      const updatedDocument = { ...movedDoc, category: categoryId === "uncategorized" ? undefined : categoryId };
      updatedSorted[categoryId] = [...updatedSorted[categoryId], updatedDocument];
      
      setSortedDocuments(updatedSorted);
      setHasChanges(true);
    }
    
    setActiveDocument(null);
    setDragOverCategory(null);
  };

  // Handle document preview
  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsPreviewOpen(true);
  };

  // Handle save
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

  // Get document icon for drag overlay
  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Sort Documents into Categories</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Drag documents from the left panel and drop them into categories on the right
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh]">
              {/* Left panel: Document list */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
              >
                <div className="border rounded-lg p-4 h-full flex flex-col">
                  <h3 className="font-medium mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                    <Badge variant="outline" className="ml-2">
                      {filteredDocuments.length}
                    </Badge>
                  </h3>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-4">
                      <AnimatePresence>
                        {filteredDocuments.map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            document={doc}
                            onDragStart={() => {
                              // This is handled by DndContext
                            }}
                            onClick={() => handlePreviewDocument(doc)}
                          />
                        ))}
                      </AnimatePresence>
                      
                      {filteredDocuments.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                          {searchQuery 
                            ? "No documents match your search" 
                            : "No documents available"}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Drag overlay */}
                  <DragOverlay>
                    {activeDocument && (
                      <Card className="w-[300px] overflow-hidden shadow-lg border-2 border-primary">
                        <div className="p-3 flex items-start">
                          <div className="mr-3 mt-1">
                            {getDocumentTypeIcon(activeDocument.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium mb-1 truncate">
                              {activeDocument.title || activeDocument.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {activeDocument.summary || activeDocument.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </DragOverlay>
                </div>
                
                {/* Right panel: Categories */}
                <div className="border rounded-lg p-4 h-full flex flex-col">
                  <h3 className="font-medium mb-3 flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    Categories
                  </h3>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          id={category.id}
                          data-category-id={category.id}
                        >
                          <CategoryDropzone
                            category={category}
                            documents={sortedDocuments[category.id] || []}
                            isOver={dragOverCategory === category.id}
                            id={category.id}
                          />
                        </div>
                      ))}
                      
                      {/* Uncategorized section */}
                      <div
                        id="uncategorized"
                        data-category-id="uncategorized"
                      >
                        <CategoryDropzone
                          category={{
                            id: "uncategorized",
                            title: "Uncategorized",
                            icon: "folder"
                          }}
                          documents={sortedDocuments["uncategorized"] || []}
                          isOver={dragOverCategory === "uncategorized"}
                          id="uncategorized"
                        />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </DndContext>
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
      
      {/* Document preview modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
