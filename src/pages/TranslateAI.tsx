import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Save,
  Languages,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translationService, TranslationFile } from "@/services/translationService";
import { ensureDocumentsBucketExists } from "@/lib/supabase";

// Language options for translation
const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "auto", label: "Auto-detect" }
];

const TranslateAI: React.FC = () => {
  // State for translation files
  const [translationFiles, setTranslationFiles] = useState<TranslationFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<TranslationFile | null>(null);
  
  // State for UI
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [editedTranslation, setEditedTranslation] = useState<string>("");
  const [languageFrom, setLanguageFrom] = useState<string>("auto");
  const [languageTo, setLanguageTo] = useState<string>("en");
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  // Refs for PDF viewer and text areas
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const ocrTextRef = useRef<HTMLDivElement>(null);
  const translatedTextRef = useRef<HTMLTextAreaElement>(null);
  
  // Load translation files on component mount
  useEffect(() => {
    loadTranslationFiles();
  }, []);
  
  // Update selected file when selectedFileId changes
  useEffect(() => {
    if (selectedFileId) {
      const getFile = async () => {
        const file = await translationService.getTranslationFileById(selectedFileId);
        if (file) {
          setSelectedFile(file);
          setEditedTranslation(file.translatedText);
          setLanguageFrom(file.languageFrom);
          setLanguageTo(file.languageTo);
          setActiveTab("translate");
        }
      };
      getFile();
    } else {
      setSelectedFile(null);
      setEditedTranslation("");
    }
  }, [selectedFileId]);
  
  // Load translation files from service
  const loadTranslationFiles = async () => {
    const files = await translationService.getTranslationFiles();
    setTranslationFiles(files);
  };
  
  // Handle file upload
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter out non-document files
    const validFiles = fileArray.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension === 'pdf' || extension === 'docx' || extension === 'doc';
    });
    
    if (validFiles.length === 0) {
      alert("Please upload PDF or Word documents only.");
      return;
    }
    
    // Ensure documents bucket exists
    try {
      await ensureDocumentsBucketExists();
    } catch (error) {
      console.error("Error ensuring documents bucket exists:", error);
      alert("Failed to access storage. Please try again later.");
      return;
    }
    
    // Upload each file
    for (const file of validFiles) {
      try {
        await translationService.uploadDocument(file, languageFrom, languageTo);
        await loadTranslationFiles();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }
  };
  
  // Handle translation
  const handleTranslate = async () => {
    if (!selectedFile) return;
    
    setIsTranslating(true);
    
    try {
      const translatedText = await translationService.translateText(
        selectedFile.id,
        selectedFile.ocrText,
        languageFrom,
        languageTo
      );
      
      setEditedTranslation(translatedText);
      await loadTranslationFiles();
      
      // Get the updated file
      const updatedFile = await translationService.getTranslationFileById(selectedFile.id);
      if (updatedFile) {
        setSelectedFile(updatedFile);
      }
    } catch (error) {
      console.error("Error translating text:", error);
      alert("Failed to translate text. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Handle saving edited translation
  const handleSaveTranslation = async () => {
    if (!selectedFile) return;
    
    try {
      const updatedFile = await translationService.updateTranslatedText(
        selectedFile.id,
        editedTranslation
      );
      
      setSelectedFile(updatedFile);
      await loadTranslationFiles();
      alert("Translation saved successfully!");
    } catch (error) {
      console.error("Error saving translation:", error);
      alert("Failed to save translation. Please try again.");
    }
  };
  
  // Handle generating report
  const handleGenerateReport = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!selectedFile) return;
    
    setIsGeneratingReport(true);
    
    try {
      const reportUrl = await translationService.generateReport(selectedFile.id, format);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `${selectedFile.filename.split('.')[0]}_translated.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await loadTranslationFiles();
      
      // Get the updated file
      const updatedFile = await translationService.getTranslationFileById(selectedFile.id);
      if (updatedFile) {
        setSelectedFile(updatedFile);
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      alert(`Failed to generate ${format} report. Please try again.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Handle deleting a translation file
  const handleDeleteFile = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this translation?")) {
      try {
        await translationService.deleteTranslationFile(fileId);
        
        if (selectedFileId === fileId) {
          setSelectedFileId(null);
        }
        
        await loadTranslationFiles();
      } catch (error) {
        console.error("Error deleting translation file:", error);
        alert("Failed to delete translation file. Please try again.");
      }
    }
  };
  
  // Create a new translation
  const handleNewTranslation = () => {
    setSelectedFileId(null);
    setActiveTab("upload");
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-gray-500';
      case 'ocr':
        return 'bg-blue-500';
      case 'translated':
        return 'bg-green-500';
      case 'edited':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'ocr':
        return 'OCR Completed';
      case 'translated':
        return 'Translated';
      case 'edited':
        return 'Edited';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };
  
  // Render PDF viewer
  const renderPdfViewer = () => {
    if (!selectedFile) return null;
    
    const fileExtension = selectedFile.filename.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <iframe
          ref={pdfViewerRef}
          src={selectedFile.originalUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      );
    } else {
      // For non-PDF files, show a placeholder
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Document Preview</h3>
          <p className="text-sm text-gray-500 mt-2">
            Preview not available for {fileExtension?.toUpperCase()} files.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.open(selectedFile.originalUrl, '_blank')}
          >
            Open Original Document
          </Button>
        </div>
      );
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">TranslateAI</h1>
              <Badge variant="outline" className="ml-2">AI-Powered Document Translator</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNewTranslation}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Translation
              </Button>
              {selectedFile && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTranslate()}
                    disabled={isTranslating || !selectedFile.ocrText}
                  >
                    {isTranslating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="h-4 w-4 mr-2" />
                        Translate
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSaveTranslation()}
                    disabled={!editedTranslation}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleGenerateReport('pdf')}
                    disabled={isGeneratingReport || !selectedFile.translatedText}
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Translation Files */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Translation Files</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2 pr-4">
                {translationFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No translation files yet</p>
                    <p className="text-sm mt-2">Upload a document to get started</p>
                  </div>
                ) : (
                  translationFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className={`border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedFileId === file.id ? 'bg-primary/10 border-primary/30' : ''
                      }`}
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate" title={file.filename}>
                            {file.filename}
                          </h3>
                          <div className="flex items-center mt-1">
                            <div className={`h-2 w-2 rounded-full ${getStatusColor(file.status)} mr-2`} />
                            <span className="text-xs text-gray-500">{getStatusLabel(file.status)}</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{file.languageFrom !== 'auto' ? file.languageFrom : 'Auto'}</span>
                            <span className="mx-1">→</span>
                            <span>{file.languageTo}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs List */}
            <div className="border-b px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="translate" disabled={!selectedFile}>Translate</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 p-0 m-0">
              <div 
                className={`h-full flex flex-col items-center justify-center p-8 ${
                  isDragging ? 'bg-primary/5 border-primary' : ''
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
                <div className="max-w-md w-full">
                  <div className="text-center mb-8">
                    <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Upload Document for Translation</h2>
                    <p className="text-gray-500">
                      Upload a PDF or Word document to extract text and translate it
                    </p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">From Language</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md text-sm"
                              value={languageFrom}
                              onChange={(e) => setLanguageFrom(e.target.value)}
                            >
                              {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">To Language</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md text-sm"
                              value={languageTo}
                              onChange={(e) => setLanguageTo(e.target.value)}
                            >
                              {languageOptions.filter(opt => opt.value !== 'auto').map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
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
                              onClick={() => document.getElementById('file-upload-main')?.click()}
                            >
                              Browse Files
                              <input
                                id="file-upload-main"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
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
                        
                        <div className="text-xs text-gray-500">
                          <p>Supported file types: PDF, DOC, DOCX</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Translate Tab */}
            <TabsContent value="translate" className="flex-1 p-0 m-0">
              {selectedFile ? (
                <div className="h-full grid grid-cols-3 divide-x">
                  {/* Original Document */}
                  <div className="overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-medium">Original Document</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                      {renderPdfViewer()}
                    </div>
                  </div>
                  
                  {/* OCR Text */}
                  <div className="overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-medium">OCR Text</h3>
                    </div>
                    <div 
                      ref={ocrTextRef}
                      className="flex-1 overflow-auto p-4 whitespace-pre-wrap font-mono text-sm"
                    >
                      {selectedFile.ocrText || "No text extracted yet."}
                    </div>
                  </div>
                  
                  {/* Translated Text */}
                  <div className="overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                      <h3 className="font-medium">Translated Text</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTranslate()}
                          disabled={isTranslating || !selectedFile.ocrText}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-translate
                        </Button>
                      </div>
                    </div>
                    <textarea
                      ref={translatedTextRef}
                      className="flex-1 p-4 resize-none border-0 font-mono text-sm"
                      value={editedTranslation}
                      onChange={(e) => setEditedTranslation(e.target.value)}
                      placeholder="Translated text will appear here..."
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">No document selected</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("upload")}
                    >
                      Upload a Document
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TranslateAI;
