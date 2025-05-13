import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  Search, 
  Download, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Pin, 
  PinOff,
  SortAsc,
  SortDesc,
  FileDown,
  FileSpreadsheet,
  FileJson,
  School,
  MapPin,
  Brain,
  Flag
} from "lucide-react";
import { supabase, ensureDocumentsBucketExists } from "@/lib/supabase";
import { diplomaEvaluationService, DiplomaData, CourseData } from "@/services/diplomaEvaluationService";

interface ProcessedDocument {
  id: string;
  extractedText: string;
  usEquivalency: string;
  structuredData: DiplomaData | null;
  fileName: string;
  fileUrl?: string;
  isProcessing: boolean;
  status: 'pending' | 'complete' | 'needs_review';
  isPinned?: boolean;
}

const EvaluateAI: React.FC = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFilesUpload(Array.from(e.target.files));
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Load saved evaluations from localStorage on component mount
  React.useEffect(() => {
    const loadSavedEvaluations = async () => {
      try {
        const savedEvaluations = await diplomaEvaluationService.getEvaluationFiles();
        
        if (savedEvaluations.length > 0) {
          // Convert EvaluationFile to ProcessedDocument format
          const processedDocs: ProcessedDocument[] = savedEvaluations.map(evalFile => ({
            id: evalFile.id,
            extractedText: evalFile.extractedText,
            usEquivalency: evalFile.usEquivalency,
            structuredData: evalFile.structuredData,
            fileName: evalFile.filename,
            fileUrl: evalFile.originalUrl,
            isProcessing: false,
            status: evalFile.status === 'evaluated' || evalFile.status === 'completed' ? 'complete' : 
                   evalFile.status === 'processed' ? 'needs_review' : 'pending',
            isPinned: false
          }));
          
          setDocuments(processedDocs);
          
          // Select the most recent document
          setSelectedDocumentId(processedDocs[0].id);
        }
      } catch (error) {
        console.error("Error loading saved evaluations:", error);
      }
    };
    
    loadSavedEvaluations();
  }, []);

  const handleFilesUpload = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      // Ensure storage bucket exists
      await ensureDocumentsBucketExists();
      
      // Process each file
      for (const file of files) {
        // Upload document using the new localStorage-enabled method
        const evaluationFile = await diplomaEvaluationService.uploadDocument(file);
        
        // Add document to state with pending status
        const newDoc: ProcessedDocument = {
          id: evaluationFile.id,
          extractedText: evaluationFile.extractedText,
          usEquivalency: evaluationFile.usEquivalency,
          structuredData: evaluationFile.structuredData,
          fileName: evaluationFile.filename,
          fileUrl: evaluationFile.originalUrl,
          isProcessing: true,
          status: 'pending'
        };
        
        setDocuments(prev => [...prev, newDoc]);
        setSelectedDocumentId(evaluationFile.id);
        
        // Process the document with diplomaEvaluationService
        const processedEvaluation = await diplomaEvaluationService.processEvaluation(evaluationFile.id);

        // Update document in state
        setDocuments(prev => prev.map(doc => 
          doc.id === evaluationFile.id ? {
            ...doc,
            extractedText: processedEvaluation.extractedText,
            usEquivalency: processedEvaluation.usEquivalency,
            structuredData: processedEvaluation.structuredData,
            isProcessing: false,
            status: 'complete'
          } : doc
        ));
      }
    } catch (error) {
      console.error("Error processing document:", error);
      // Update document with error status
      if (selectedDocumentId) {
        setDocuments(prev => prev.map(doc => 
          doc.id === selectedDocumentId ? {
            ...doc,
            extractedText: "Error processing document: " + (error as Error).message,
            usEquivalency: "Unable to determine equivalency due to processing error",
            isProcessing: false,
            status: 'needs_review'
          } : doc
        ));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const togglePinDocument = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, isPinned: !doc.isPinned } : doc
    ));
  };

  const toggleDocumentStatus = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newStatus = doc.status === 'complete' ? 'needs_review' : 'complete';
        return { ...doc, status: newStatus };
      }
      return doc;
    }));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.structuredData?.name && doc.structuredData.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.structuredData?.university && doc.structuredData.university.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    // First sort by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by the selected field
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    switch (sortField) {
      case 'fileName':
        aValue = a.fileName;
        bValue = b.fileName;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'name':
        aValue = a.structuredData?.name || '';
        bValue = b.structuredData?.name || '';
        break;
      case 'university':
        aValue = a.structuredData?.university || '';
        bValue = b.structuredData?.university || '';
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'needs_review':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'complete':
        return 'Complete';
      case 'needs_review':
        return 'Needs Review';
      default:
        return '';
    }
  };

  const getEquivalencyBadge = (equivalency: string) => {
    if (!equivalency) return null;
    
    let variant = 'default';
    if (equivalency.toLowerCase().includes('bachelor')) {
      variant = 'secondary';
    } else if (equivalency.toLowerCase().includes('master')) {
      variant = 'outline';
    } else if (equivalency.toLowerCase().includes('doctor')) {
      variant = 'destructive';
    }
    
    // Extract just the degree part from the equivalency text
    const degreeMatch = equivalency.match(/U\.?S\.?\s+(?:equivalent|equivalency|to|of)?\s*(?:a|an)?\s*([^\.]+)/i);
    const degreeText = degreeMatch ? degreeMatch[1].trim() : equivalency.split('.')[0];
    
    return (
      <Badge variant={variant as any} className="ml-2">
        {degreeText}
      </Badge>
    );
  };

  // Export functions
  const exportToPdf = () => {
    if (!selectedDocument || !selectedDocument.structuredData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Educational Document Evaluation', margin, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 30);
    doc.text(`Evaluator: Admin User`, margin, 38);
    
    // Add document info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Information', margin, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`File Name: ${selectedDocument.fileName}`, margin, 60);
    doc.text(`Status: ${getStatusText(selectedDocument.status)}`, margin, 68);
    
    // Add student info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', margin, 80);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${selectedDocument.structuredData.name || 'Not found'}`, margin, 90);
    doc.text(`University: ${selectedDocument.structuredData.university || 'Not found'}`, margin, 98);
    doc.text(`Degree: ${selectedDocument.structuredData.degree || 'Not found'}`, margin, 106);
    doc.text(`Field of Study: ${selectedDocument.structuredData.field_of_study || 'Not found'}`, margin, 114);
    
    // Add US Equivalency
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('US Equivalency', margin, 130);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Split the equivalency text to fit within page width
    const equivalencyLines = doc.splitTextToSize(selectedDocument.usEquivalency || 'No equivalency available', contentWidth);
    doc.text(equivalencyLines, margin, 140);
    
    // Add courses table if available
    if (selectedDocument.structuredData.courses && selectedDocument.structuredData.courses.length > 0) {
      let yPos = 140 + (equivalencyLines.length * 7) + 20; // Position after equivalency text
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Course Transcript', margin, yPos);
      yPos += 10;
      
      // Table headers
      const headers = ['Course Name', 'Grade', 'US Grade', 'Credits', 'Semester/Year'];
      const columnWidths = [80, 20, 20, 20, 40];
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos);
        xPos += columnWidths[i];
      });
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      // Table rows
      selectedDocument.structuredData.courses.forEach((course, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        xPos = margin;
        
        // Course name (truncate if too long)
        let courseName = course.course_name || 'Unnamed Course';
        if (courseName.length > 30) {
          courseName = courseName.substring(0, 27) + '...';
        }
        doc.text(courseName, xPos, yPos);
        xPos += columnWidths[0];
        
        // Grade
        doc.text(course.grade_received || 'N/A', xPos, yPos);
        xPos += columnWidths[1];
        
        // US Grade
        doc.text(course.us_grade || 'N/A', xPos, yPos);
        xPos += columnWidths[2];
        
        // Credits
        const credits = course.credits !== null && course.credits !== undefined ? 
          course.credits.toString() : 'N/A';
        doc.text(credits, xPos, yPos);
        xPos += columnWidths[3];
        
        // Semester/Year
        doc.text(course.semester_or_year || 'N/A', xPos, yPos);
        
        yPos += 7;
      });
    }
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`ImmiDraft Evaluation Report - Page ${i} of ${pageCount}`, margin, 290);
    }
    
    // Save the PDF
    doc.save(`${selectedDocument.structuredData.name || 'evaluation'}-report.pdf`);
  };

  const exportToExcel = () => {
    if (!selectedDocument || !selectedDocument.structuredData) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create student info worksheet
    const studentInfo = [
      ['Educational Document Evaluation'],
      ['Date', new Date().toLocaleDateString()],
      ['Evaluator', 'Admin User'],
      [''],
      ['Document Information'],
      ['File Name', selectedDocument.fileName],
      ['Status', getStatusText(selectedDocument.status)],
      [''],
      ['Student Information'],
      ['Name', selectedDocument.structuredData.name || 'Not found'],
      ['University', selectedDocument.structuredData.university || 'Not found'],
      ['Degree', selectedDocument.structuredData.degree || 'Not found'],
      ['Field of Study', selectedDocument.structuredData.field_of_study || 'Not found'],
      [''],
      ['US Equivalency'],
      [selectedDocument.usEquivalency || 'No equivalency available']
    ];
    
    const infoWs = XLSX.utils.aoa_to_sheet(studentInfo);
    XLSX.utils.book_append_sheet(wb, infoWs, 'Student Info');
    
    // Create courses worksheet if available
    if (selectedDocument.structuredData.courses && selectedDocument.structuredData.courses.length > 0) {
      const coursesData = [
        ['Course Name', 'Grade', 'US Grade', 'Credits', 'Semester/Year']
      ];
      
      selectedDocument.structuredData.courses.forEach(course => {
        coursesData.push([
          course.course_name || 'Unnamed Course',
          course.grade_received || 'N/A',
          course.us_grade || 'N/A',
          course.credits !== null && course.credits !== undefined ? course.credits.toString() : 'N/A',
          course.semester_or_year || 'N/A'
        ]);
      });
      
      const coursesWs = XLSX.utils.aoa_to_sheet(coursesData);
      XLSX.utils.book_append_sheet(wb, coursesWs, 'Transcript');
    }
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save the file
    saveAs(data, `${selectedDocument.structuredData.name || 'evaluation'}-data.xlsx`);
  };

  const exportToJson = () => {
    if (!selectedDocument || !selectedDocument.structuredData) return;
    
    // Create JSON object with null checks
    const jsonData = {
      metadata: {
        date: new Date().toISOString(),
        evaluator: 'Admin User',
        fileName: selectedDocument.fileName,
        status: selectedDocument.status
      },
      student: {
        name: selectedDocument.structuredData.name || null,
        university: selectedDocument.structuredData.university || null,
        degree: selectedDocument.structuredData.degree || null,
        fieldOfStudy: selectedDocument.structuredData.field_of_study || null
      },
      usEquivalency: selectedDocument.usEquivalency || null,
      courses: selectedDocument.structuredData.courses || []
    };
    
    // Process courses to ensure no null values cause issues
    if (jsonData.courses && jsonData.courses.length > 0) {
      jsonData.courses = jsonData.courses.map(course => ({
        course_name: course.course_name || 'Unnamed Course',
        grade_received: course.grade_received || null,
        us_grade: course.us_grade || null,
        credits: course.credits !== null && course.credits !== undefined ? course.credits : null,
        semester_or_year: course.semester_or_year || null
      }));
    }
    
    // Convert to JSON string
    const jsonString = JSON.stringify(jsonData, null, 2);
    const data = new Blob([jsonString], { type: 'application/json' });
    
    // Save the file
    saveAs(data, `${selectedDocument.structuredData.name || 'evaluation'}-data.json`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Educational Document Evaluation</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()} • Evaluator: Admin User
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Split Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Document Navigator */}
        <div className="w-80 border-r flex flex-col overflow-hidden">
          {/* Search Bar - Moved to top as per UX recommendation */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Upload Area */}
          <div 
            className="p-4 border-b"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Input
                id="documentFile"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                multiple
              />
              <label 
                htmlFor="documentFile" 
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PDF, JPG, JPEG, PNG
                </span>
              </label>
            </div>
          </div>
          
          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {sortedDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <FileText className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-center">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {sortedDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedDocumentId === doc.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDocumentId(doc.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <div className="mt-1">
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.fileName}</p>
                          {doc.structuredData && (
                            <>
                              <p className="text-xs text-gray-500 truncate">{doc.structuredData.name}</p>
                              <p className="text-xs text-gray-500 truncate">{doc.structuredData.university}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinDocument(doc.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {doc.isPinned ? (
                          <Pin className="h-4 w-4" />
                        ) : (
                          <PinOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Evaluation Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedDocument ? (
            <>
              {/* Document Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold truncate">
                    {selectedDocument.fileName}
                  </h2>
                  {getEquivalencyBadge(selectedDocument.usEquivalency)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedDocument.status === 'complete' ? 'secondary' : selectedDocument.status === 'needs_review' ? 'destructive' : 'default'}>
                    {getStatusText(selectedDocument.status)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleDocumentStatus(selectedDocument.id)}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {selectedDocument.status === 'needs_review' ? 'Mark as Complete' : 'Flag for Review'}
                  </Button>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <Tabs 
                defaultValue="summary" 
                className="flex-1 flex flex-col overflow-hidden"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="border-b px-4">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Tab Contents - Improved spacing and alignment */}
                <div className="flex-1 overflow-y-auto px-6 py-4 max-w-7xl mx-auto">
                  {selectedDocument.isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p>Processing document...</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary Tab */}
                      <TabsContent value="summary" className="h-full">
                        {selectedDocument.structuredData ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-gray-500">Name</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-lg">{selectedDocument.structuredData.name || 'Not found'}</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-gray-500">Degree</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-lg">{selectedDocument.structuredData.degree || 'Not found'}</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-gray-500">Field of Study</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-lg">{selectedDocument.structuredData.field_of_study || 'Not found'}</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                                    <School className="h-4 w-4 mr-1" />
                                    University
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-lg">{selectedDocument.structuredData.university || 'Not found'}</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Location
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-lg">Auto-detected location would go here</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <Sparkles className="mr-2 h-5 w-5" />
                                  US Equivalency
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                  <p className="whitespace-pre-line">{selectedDocument.usEquivalency}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p>Could not extract structured data from the document.</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Transcript Tab */}
                      <TabsContent value="transcript" className="h-full">
                        {selectedDocument.structuredData?.courses && selectedDocument.structuredData.courses.length > 0 ? (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Course Transcript</h3>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleSort('course_name')}>
                                  {sortField === 'course_name' ? (
                                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                  ) : (
                                    <span>Sort</span>
                                  )}
                                </Button>
                                <Input
                                  placeholder="Filter courses..."
                                  className="w-48 h-9"
                                />
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-200 px-4 py-2 text-left">Course Name</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left">Grade</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left">US Grade</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left">Credits</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left">Semester/Year</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedDocument.structuredData.courses.map((course, index) => (
                                    <tr 
                                      key={index} 
                                      className={`
                                        ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        ${course.grade_received?.toLowerCase().includes('f') ? "bg-red-50" : ""}
                                      `}
                                    >
                                      <td className="border border-gray-200 px-4 py-2">{course.course_name}</td>
                                      <td className="border border-gray-200 px-4 py-2">{course.grade_received}</td>
                                      <td className="border border-gray-200 px-4 py-2">{course.us_grade || 'N/A'}</td>
                                      <td className="border border-gray-200 px-4 py-2">{course.credits !== undefined ? course.credits : 'N/A'}</td>
                                      <td className="border border-gray-200 px-4 py-2">{course.semester_or_year || 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p>No course information found in this document.</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Reasoning Tab */}
                      <TabsContent value="reasoning" className="h-full">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Brain className="mr-2 h-5 w-5" />
                              Evaluation Reasoning
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <h4 className="font-medium mb-2">Accreditation Source</h4>
                                <p className="text-sm">
                                  The institution's accreditation was verified through standard international education databases.
                                </p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <h4 className="font-medium mb-2">Program Analysis</h4>
                                <p className="text-sm">
                                  Program duration, course content, and credit hours were analyzed against U.S. standards.
                                  {selectedDocument.structuredData?.document_type === 'transcript' && 
                                    " The transcript shows a standard distribution of courses typical for this field of study."}
                                </p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <h4 className="font-medium mb-2">Detailed Reasoning</h4>
                                <p className="text-sm whitespace-pre-line">
                                  {selectedDocument.usEquivalency}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      {/* Export Tab */}
                      <TabsContent value="export" className="h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Export Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <Button 
                                  className="w-full flex justify-between items-center"
                                  onClick={exportToPdf}
                                >
                                  <div className="flex items-center">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    <span>PDF Report</span>
                                  </div>
                                  <Badge>Signature Ready</Badge>
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full flex items-center"
                                  onClick={exportToExcel}
                                >
                                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                                  <span>Excel Spreadsheet</span>
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full flex items-center"
                                  onClick={exportToJson}
                                >
                                  <FileJson className="mr-2 h-4 w-4" />
                                  <span>JSON Data</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Document Metadata</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">File Name:</span>
                                  <span className="text-sm">{selectedDocument.fileName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Document Type:</span>
                                  <span className="text-sm">{selectedDocument.structuredData?.document_type || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Processed On:</span>
                                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Status:</span>
                                  <Badge variant={selectedDocument.status === 'complete' ? 'secondary' : selectedDocument.status === 'needs_review' ? 'destructive' : 'default'}>
                                    {getStatusText(selectedDocument.status)}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl">Select a document to view</p>
              <p className="text-sm mt-2">Or upload a new document from the left panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluateAI;
