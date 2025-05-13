import React, { useState, useEffect } from "react";
import { Brain, FileText, Upload, Sparkles, Folder, Save, Plus, Trash2, Calendar, Tag } from "lucide-react";
import VisaTypeSelector from "@/components/VisaTypeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import LetterEditor from "@/components/LetterEditor";
import { documentProcessingService } from "@/services/documentProcessingService";
import { aiService } from "@/services/aiService";
import { letterService, Letter } from "@/services/letterService";

// Document category types
type DocumentCategory = 
  | "resume" 
  | "degree" 
  | "license" 
  | "employment" 
  | "support" 
  | "recognition" 
  | "media";

// Document interface
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  category: DocumentCategory;
  tags: string[];
  summary: string;
  uploadDate: string;
  publicUrl?: string;
  extractedText?: string;
  status: "uploaded" | "processing" | "processed" | "error";
  error?: string;
}

// Category configuration
const categories: { id: DocumentCategory; label: string; icon: React.ReactNode }[] = [
  { id: "resume", label: "Resume", icon: <FileText className="h-4 w-4" /> },
  { id: "degree", label: "Degree & Diplomas", icon: <FileText className="h-4 w-4" /> },
  { id: "license", label: "License & Membership", icon: <FileText className="h-4 w-4" /> },
  { id: "employment", label: "Employment Records", icon: <FileText className="h-4 w-4" /> },
  { id: "support", label: "Support Letters", icon: <FileText className="h-4 w-4" /> },
  { id: "recognition", label: "Recognitions", icon: <FileText className="h-4 w-4" /> },
  { id: "media", label: "Press Media", icon: <FileText className="h-4 w-4" /> },
];

const LetterAI: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [letterContent, setLetterContent] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
  const [isSavingLetter, setIsSavingLetter] = useState<boolean>(false);
  const [visaType, setVisaType] = useState<string>("O-1A");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [savedLetters, setSavedLetters] = useState<Letter[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [letterTitle, setLetterTitle] = useState<string>("");
  const [showSavedLetters, setShowSavedLetters] = useState<boolean>(false);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  // Load saved letters on component mount
  useEffect(() => {
    loadSavedLetters();
  }, []);

  // Maximum file size in bytes (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Load saved letters from the database
  const loadSavedLetters = async () => {
    const letters = await letterService.getLetters();
    setSavedLetters(letters);
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter out files that are too large
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];
    
    fileArray.forEach(file => {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file);
      } else {
        oversizedFiles.push(file);
      }
    });
    
    // Show warning for oversized files
    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map(f => f.name).join(", ");
      alert(`The following files exceed the 10MB size limit and will not be processed: ${oversizedFileNames}`);
    }
    
    // If no valid files, return early
    if (validFiles.length === 0) {
      return;
    }
    
    // Create document objects with initial status
    const newDocuments = validFiles.map((file) => {
      const id = crypto.randomUUID();
      const sizeInKB = Math.round(file.size / 1024);
      const sizeStr = sizeInKB < 1024 
        ? `${sizeInKB} KB` 
        : `${(sizeInKB / 1024).toFixed(1)} MB`;
      
      return {
        id,
        name: file.name,
        size: sizeStr,
        type: file.type,
        category: "resume" as DocumentCategory, // Default category, will be updated after processing
        tags: [],
        summary: "Processing document...",
        uploadDate: new Date().toISOString().split('T')[0],
        status: "uploaded" as const,
      };
    });
    
    // Add new documents to state
    setDocuments((prev) => [...prev, ...newDocuments]);
    
    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const docId = newDocuments[i].id;
      
      try {
        // Update status to processing
        setDocuments((prev) => 
          prev.map((doc) => 
            doc.id === docId ? { ...doc, status: "processing" } : doc
          )
        );
        
        // Upload and process the document
        const result = await documentProcessingService.uploadAndProcessDocument(file);
        
        if (result.success) {
          // Determine document category based on AI tags or name
          let category: DocumentCategory = "resume";
          
          if (result.tags) {
            const tags = result.tags.map((tag: string) => tag.toLowerCase());
            
            if (tags.some(tag => tag.includes("resume") || tag.includes("cv"))) {
              category = "resume";
            } else if (tags.some(tag => tag.includes("degree") || tag.includes("diploma") || tag.includes("education"))) {
              category = "degree";
            } else if (tags.some(tag => tag.includes("license") || tag.includes("membership") || tag.includes("certification"))) {
              category = "license";
            } else if (tags.some(tag => tag.includes("employment") || tag.includes("work") || tag.includes("job"))) {
              category = "employment";
            } else if (tags.some(tag => tag.includes("letter") || tag.includes("recommendation") || tag.includes("reference"))) {
              category = "support";
            } else if (tags.some(tag => tag.includes("award") || tag.includes("recognition") || tag.includes("prize"))) {
              category = "recognition";
            } else if (tags.some(tag => tag.includes("media") || tag.includes("press") || tag.includes("news") || tag.includes("article"))) {
              category = "media";
            }
          }
          
          // Update document with processed data
          setDocuments((prev) => 
            prev.map((doc) => 
              doc.id === docId ? { 
                ...doc, 
                status: "processed",
                category,
                tags: result.tags || [],
                summary: result.summary || "No summary available",
                extractedText: result.extractedText,
                publicUrl: result.publicUrl
              } : doc
            )
          );
        } else {
          // Update document with error
          setDocuments((prev) => 
            prev.map((doc) => 
              doc.id === docId ? { 
                ...doc, 
                status: "error",
                error: result.error || "Failed to process document"
              } : doc
            )
          );
        }
      } catch (error) {
        console.error(`Error processing document ${docId}:`, error);
        
        // Update document with error
        setDocuments((prev) => 
          prev.map((doc) => 
            doc.id === docId ? { 
              ...doc, 
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error"
            } : doc
          )
        );
      }
    }
  };

  // Generate letter based on processed documents
  const generateLetter = async () => {
    if (documents.length === 0) {
      alert("Please upload at least one document before generating a letter.");
      return;
    }
    
    setIsGeneratingLetter(true);
    
    try {
      // Prepare documents for AI service
      const processedDocs = documents
        .filter(doc => doc.status === "processed")
        .map(doc => ({
          id: doc.id,
          title: doc.name,
          description: doc.summary,
          type: doc.category,
          tags: doc.tags
        }));
      
      // Generate letter using AI service
      const result = await aiService.draftExpertLetter(
        visaType,
        { name: clientName || "Beneficiary" }, // Use client name if provided
        { name: "Expert" }, // Placeholder expert info
        processedDocs
      );
      
      // Update letter content
      setLetterContent(result.content);
      
      // Generate a default title if none exists
      if (!letterTitle) {
        setLetterTitle(`${visaType} Expert Letter for ${clientName || "Client"}`);
      }
    } catch (error) {
      console.error("Error generating letter:", error);
      alert("Failed to generate letter. Please try again.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Save the current letter
  const saveLetter = async () => {
    if (!letterContent) {
      alert("Please generate a letter before saving.");
      return;
    }

    if (!letterTitle) {
      alert("Please provide a title for the letter.");
      return;
    }
    
    setIsSavingLetter(true);
    
    try {
      const letter: Letter = {
        title: letterTitle,
        content: letterContent,
        client_name: clientName,
        visa_type: visaType,
        letter_type: 'expert',
        document_ids: documents.map(doc => doc.id),
        tags: documents.flatMap(doc => doc.tags || []).slice(0, 5) // Take up to 5 tags from documents
      };
      
      let savedLetter;
      
      if (selectedLetterId) {
        // Update existing letter
        savedLetter = await letterService.updateLetter(selectedLetterId, letter);
      } else {
        // Create new letter
        savedLetter = await letterService.createLetter(letter);
      }
      
      if (savedLetter) {
        alert(`Letter "${letterTitle}" saved successfully!`);
        setSelectedLetterId(savedLetter.id);
        await loadSavedLetters(); // Refresh the list
      } else {
        throw new Error("Failed to save letter");
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      alert("Failed to save letter. Please try again.");
    } finally {
      setIsSavingLetter(false);
    }
  };

  // Load a saved letter
  const loadLetter = async (letterId: string) => {
    try {
      const letter = await letterService.getLetterById(letterId);
      
      if (letter) {
        setLetterContent(letter.content);
        setLetterTitle(letter.title);
        setClientName(letter.client_name || "");
        setVisaType(letter.visa_type);
        setSelectedLetterId(letter.id);
      }
    } catch (error) {
      console.error(`Error loading letter ${letterId}:`, error);
      alert("Failed to load the selected letter.");
    }
  };

  // Create a new letter (reset form)
  const createNewLetter = () => {
    setLetterContent("");
    setLetterTitle("");
    setClientName("");
    setDocuments([]);
    setSelectedLetterId(null);
  };

  // Delete a saved letter
  const deleteLetter = async (letterId: string) => {
    if (confirm("Are you sure you want to delete this letter?")) {
      try {
        const success = await letterService.deleteLetter(letterId);
        
        if (success) {
          await loadSavedLetters(); // Refresh the list
          
          // If the deleted letter was selected, reset the form
          if (selectedLetterId === letterId) {
            createNewLetter();
          }
        } else {
          throw new Error("Failed to delete letter");
        }
      } catch (error) {
        console.error(`Error deleting letter ${letterId}:`, error);
        alert("Failed to delete the letter.");
      }
    }
  };

  // Filter documents by category
  const filteredDocuments = activeCategory === "all" 
    ? documents 
    : documents.filter(doc => doc.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b px-8 py-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">LetterAI</h1>
              <Badge variant="outline" className="ml-2">Expert Opinion Letter Generator</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSavedLetters(!showSavedLetters)}
              >
                <Folder className="h-4 w-4 mr-2" />
                {showSavedLetters ? "Hide Saved Letters" : "Show Saved Letters"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={createNewLetter}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Letter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files);
                    e.target.value = ''; // Reset input
                  }
                }}
              />
              <Button 
                onClick={generateLetter}
                size="sm"
                disabled={isGeneratingLetter || documents.length === 0}
              >
                {isGeneratingLetter ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Letter
                  </>
                )}
              </Button>
              <Button 
                onClick={saveLetter}
                size="sm"
                disabled={isSavingLetter || !letterContent}
                variant="default"
              >
                {isSavingLetter ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Letter
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Client Info and Letter Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Client Name"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Letter Title"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
              />
            </div>
            <div>
              <VisaTypeSelector 
                value={visaType}
                onChange={setVisaType}
              />
            </div>
          </div>
          
          {/* Saved Letters List */}
          {showSavedLetters && (
            <div className="border rounded-md p-2 bg-gray-50">
              <h3 className="font-medium text-sm mb-2">Saved Letters</h3>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {savedLetters.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No saved letters yet</p>
                ) : (
                  savedLetters.map((letter) => (
                    <div 
                      key={letter.id} 
                      className={`flex items-center justify-between p-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 ${
                        selectedLetterId === letter.id ? 'bg-primary/10 border border-primary/30' : 'bg-white border'
                      }`}
                      onClick={() => loadLetter(letter.id!)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{letter.title}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(letter.created_at!).toLocaleDateString()}
                          {letter.client_name && (
                            <>
                              <span className="mx-1">•</span>
                              {letter.client_name}
                            </>
                          )}
                          <span className="mx-1">•</span>
                          {letter.visa_type}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLetter(letter.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Document Categories */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Document Categories</h2>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                  activeCategory === "all" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                <Folder className="h-4 w-4" />
                <span>All Documents ({documents.length})</span>
              </button>
              
              {categories.map((category) => {
                const count = documents.filter(doc => doc.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      activeCategory === category.id 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span>{category.label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Document Summaries */}
          <div className="p-4 border-t">
            <h2 className="font-semibold mb-4">Document Summaries</h2>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-3 pr-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <div className="mt-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate" title={doc.name}>
                            {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {doc.size} • {doc.uploadDate}
                          </p>
                          {doc.status === "processing" ? (
                            <div className="space-y-1">
                              <p className="text-xs">Processing document...</p>
                              <Progress value={50} className="h-1" />
                            </div>
                          ) : doc.status === "error" ? (
                            <p className="text-xs text-red-500">{doc.error}</p>
                          ) : (
                            <>
                              <p className="text-xs line-clamp-3">{doc.summary}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{doc.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No documents in this category</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Middle - Letter Editor */}
        <div className="flex-1 overflow-hidden">
          <LetterEditor 
            letterType="expert"
            initialContent={letterContent || "Your expert opinion letter will appear here after you upload documents and click 'Generate Letter'."}
            documents={documents.map(doc => ({
              id: doc.id,
              name: doc.name,
              criteria: [doc.category],
              tags: doc.tags,
              size: doc.size,
              type: doc.type,
              uploadDate: doc.uploadDate
            }))}
            showComments={false}
            onContentChange={(content) => setLetterContent(content)}
            onSave={saveLetter}
          />
        </div>
        
        {/* Right - Upload Area */}
        <div 
          className={`w-80 border-l bg-white p-4 flex flex-col ${
            isDragging ? "bg-primary/5 border-primary" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files);
            }
          }}
        >
          <h2 className="font-semibold mb-4">Upload Documents</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Maximum file size: 10MB. Larger files will not be processed.
          </p>
          
          <div className="border-2 border-dashed rounded-lg p-6 text-center mb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Drag and drop files here</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse your files
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="relative"
                onClick={() => document.getElementById('file-upload-sidebar')?.click()}
              >
                Browse Files
                <input
                  id="file-upload-sidebar"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files);
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
              </Button>
            </div>
          </div>
          
          <h3 className="font-medium text-sm mb-2">Recently Uploaded</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center space-x-3 text-sm p-2 rounded-md hover:bg-gray-50">
                  <div className={`h-2 w-2 rounded-full ${
                    doc.status === "processed" ? "bg-green-500" : 
                    doc.status === "processing" ? "bg-amber-500" : 
                    doc.status === "error" ? "bg-red-500" : "bg-gray-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium" title={doc.name}>{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.status === "processed" ? "Processed" : 
                       doc.status === "processing" ? "Processing..." : 
                       doc.status === "error" ? "Error" : "Uploaded"}
                    </p>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Processing Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploaded</span>
                <span>{documents.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Processed</span>
                <span>{documents.filter(d => d.status === "processed").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Processing</span>
                <span>{documents.filter(d => d.status === "processing").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Failed</span>
                <span>{documents.filter(d => d.status === "error").length}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="sm"
              onClick={generateLetter}
              disabled={isGeneratingLetter || documents.length === 0}
            >
              {isGeneratingLetter ? "Generating..." : "Generate Letter"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LetterAI;
