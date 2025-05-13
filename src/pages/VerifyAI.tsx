import React, { useState, useEffect } from "react";
import { Shield, Upload, FileText, AlertTriangle, CheckCircle, Info, Loader2, HelpCircle } from "lucide-react";
import { documentVerificationService, VerificationResult, VerificationDocument } from "../services/documentVerificationService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Document type for the UI
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  preview?: string;
  status: "uploading" | "processing" | "analyzed" | "error";
  result?: VerificationResult;
}

const VerifyAI: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  
  // Effect to animate the progress bar when a document is selected
  useEffect(() => {
    if (selectedDocument?.status === "analyzed" && selectedDocument?.result) {
      // Reset progress to 0
      setProgressValue(0);
      
      // Animate to the actual confidence score
      const timer = setTimeout(() => {
        setProgressValue(selectedDocument.result.confidenceScore);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDocument]);
  
  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newDocs = Array.from(files).map((file) => {
      const id = crypto.randomUUID();
      const sizeInKB = Math.round(file.size / 1024);
      const sizeStr = sizeInKB < 1024 
        ? `${sizeInKB} KB` 
        : `${(sizeInKB / 1024).toFixed(1)} MB`;
      
      // Create a document preview URL
      const preview = URL.createObjectURL(file);
      
      // Create new document object
      const newDoc: Document = {
        id,
        name: file.name,
        size: sizeStr,
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0],
        preview,
        status: "uploading"
      };
      
      return newDoc;
    });
    
    // Add new documents to state
    setDocuments(prev => [...prev, ...newDocs]);
    
    // Process each document
    for (const doc of newDocs) {
      // Update status to processing
      setDocuments(prev => 
        prev.map(d => d.id === doc.id ? { ...d, status: "processing" } : d)
      );
      
      try {
        // Create verification document object
        const verificationDoc: VerificationDocument = {
          id: doc.id,
          name: doc.name,
          file: Array.from(files).find(f => f.name === doc.name)!,
          type: doc.type,
          size: parseInt(doc.size)
        };
        
        // Verify document using service
        const result = await documentVerificationService.verifyDocument(verificationDoc);
        
        // Update document with result
        setDocuments(prev => {
          return prev.map(d => 
            d.id === doc.id ? { ...d, status: "analyzed", result } : d
          );
        });
        
        // Update the selected document if this is the current selection
        // or select the first document if none is selected
        setSelectedDocument(prev => {
          if (prev && prev.id === doc.id) {
            // If this is the currently selected document, update it with the result
            return { ...prev, status: "analyzed", result };
          }
          // Otherwise, if no document is selected, select this one
          if (!prev) {
            const updatedDoc: Document = {
              ...doc,
              status: "analyzed",
              result
            };
            return updatedDoc;
          }
          return prev;
        });
      } catch (error) {
        console.error(`Error processing document ${doc.name}:`, error);
        
        // Update document with error status
        setDocuments(prev => 
          prev.map(d => d.id === doc.id ? { ...d, status: "error" } : d)
        );
      }
    }
  };
  
  // Render verdict badge based on verification result
  const renderVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Likely Authentic":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {verdict}
          </Badge>
        );
      case "Possibly Fake":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {verdict}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Info className="h-3 w-3 mr-1" />
            {verdict}
          </Badge>
        );
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">VerifyAI</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area - Left Panel */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
            
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
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
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium">Drag and drop files here</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accepts PDF, JPG, PNG, DOCX
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Browse Files
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </Button>
              </div>
            </div>
            
            <h3 className="text-base font-medium mb-3">Upload Status</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`p-3 rounded-lg border flex items-center space-x-3 cursor-pointer ${
                        selectedDocument?.id === doc.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                      </div>
                      <div>
                        {doc.status === "uploading" && (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Uploading</span>
                          </div>
                        )}
                        {doc.status === "processing" && (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground mt-1">Processing</span>
                          </div>
                        )}
                        {doc.status === "analyzed" && doc.result && (
                          <div>
                            {renderVerdictBadge(doc.result.verdict)}
                          </div>
                        )}
                        {doc.status === "error" && (
                          <div className="flex flex-col items-center">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-xs text-destructive mt-1">Error</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Document Preview - Middle Panel */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
            
            {selectedDocument ? (
              <div className="flex flex-col h-[500px]">
                {selectedDocument.preview ? (
                  <div className="flex-1 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {selectedDocument.type.startsWith('image/') ? (
                      <img 
                        src={selectedDocument.preview} 
                        alt={selectedDocument.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : selectedDocument.type === 'application/pdf' ? (
                      <iframe 
                        src={selectedDocument.preview} 
                        title={selectedDocument.name}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Preview not available for this file type
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No preview available
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <h3 className="text-base font-medium">{selectedDocument.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDocument.size} • Uploaded on {selectedDocument.uploadDate}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] border rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Select a document to preview
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* AI Analysis Report - Right Panel */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis Report</h2>
            
            {selectedDocument && selectedDocument.result ? (
              <div className="space-y-6">
                {/* Confidence Status Bar */}
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <h3 className="text-base font-medium">Confidence Score</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              This score represents the AI's confidence in the document's authenticity based on various factors including formatting, security features, and content analysis.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold text-lg">
                      {selectedDocument.result.confidenceScore}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={100} 
                      className="h-3 bg-gray-100"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${
                        selectedDocument.result.confidenceScore >= 80 
                          ? 'bg-green-500' 
                          : selectedDocument.result.confidenceScore >= 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>High Risk</span>
                    <span>Possibly Fake</span>
                    <span>Likely Authentic</span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-center">
                    <Badge 
                      className={`text-sm py-1 px-3 ${
                        selectedDocument.result.confidenceScore >= 80 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : selectedDocument.result.confidenceScore >= 60 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {selectedDocument.result.confidenceScore >= 80 
                        ? <CheckCircle className="h-4 w-4 mr-1" /> 
                        : selectedDocument.result.confidenceScore >= 60 
                          ? <Info className="h-4 w-4 mr-1" /> 
                          : <AlertTriangle className="h-4 w-4 mr-1" />
                      }
                      {selectedDocument.result.confidenceScore >= 80 
                        ? "Likely Authentic" 
                        : selectedDocument.result.confidenceScore >= 60 
                          ? "Possibly Fake" 
                          : "High Risk / Suspicious"
                      }
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium">Verification Result</h3>
                    {renderVerdictBadge(selectedDocument.result.verdict)}
                  </div>
                </div>
                
                {/* Document Information - What the AI "saw" */}
                {selectedDocument.result.extractedInfo && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-medium mb-2">Document Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Document Type:</span>
                        <span className="font-medium">{selectedDocument.result.extractedInfo.documentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institution:</span>
                        <span className="font-medium">{selectedDocument.result.extractedInfo.institutionName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-medium">{selectedDocument.result.extractedInfo.recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Date:</span>
                        <span className="font-medium">{selectedDocument.result.extractedInfo.issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Degree/Certification:</span>
                        <span className="font-medium">{selectedDocument.result.extractedInfo.degreeOrCertification}</span>
                      </div>
                      
                      {selectedDocument.result.extractedInfo.keyElements.length > 0 && (
                        <div className="mt-3">
                          <span className="text-muted-foreground">Key Elements:</span>
                          <ul className="mt-1 space-y-1 pl-4 list-disc">
                            {selectedDocument.result.extractedInfo.keyElements.map((element, index) => (
                              <li key={index}>{element}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-base font-medium mb-2">Flags</h3>
                  {selectedDocument.result.flags.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedDocument.result.flags.map((flag, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                          <span className="text-sm">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No issues detected</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-2">Suggested Action</h3>
                  <p className="text-sm">{selectedDocument.result.suggestedAction}</p>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-2">Verification Options</h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email to Registrar
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Reverse Image Search
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Check External Database
                    </Button>
                  </div>
                </div>
                
                {selectedDocument.result.emailTemplate && (
                  <div>
                    <h3 className="text-base font-medium mb-2">Email Template</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-xs whitespace-pre-wrap">
                        {selectedDocument.result.emailTemplate}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedDocument && selectedDocument.status === "processing" ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing document...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : selectedDocument && selectedDocument.status === "uploading" ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Uploading document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Upload and select a document to see AI analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Missing components
const Mail = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ExternalLink = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

export default VerifyAI;
