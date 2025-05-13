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

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  tags: string[];
  criteria: string[];
  uploadDate: string;
  preview?: string;
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
              
              // Update documents state
              const updatedDocs = [...documentsState, ...newDocs];
              updateDocuments(updatedDocs);
              
              // Call onUpload callback
              onUpload(files);
              
              // Show success message
              alert(`Successfully uploaded ${files.length} file(s)`);
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
                    
                    // Update documents state
                    const updatedDocs = [...documentsState, ...newDocs];
                    updateDocuments(updatedDocs);
                    
                    // Call onUpload callback
                    onUpload(files);
                    
                    // Reset the file input
                    e.target.value = '';
                    
                    // Show success message
                    alert(`Successfully uploaded ${files.length} file(s)`);
                  }
                }}
              />
            </Button>
          </div>
        </div>
        
        {/* Document List */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Documents ({documentsState.length})
            </TabsTrigger>
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
    </div>
  );
}
