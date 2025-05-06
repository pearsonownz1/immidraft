import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Check,
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

const DocumentUploader = ({
  onUpload = () => {},
  onTagDocument = () => {},
  onAssignCriteria = () => {},
  documents = [
    {
      id: "1",
      name: "Resume.pdf",
      size: "245 KB",
      type: "application/pdf",
      tags: ["Resume", "Professional"],
      criteria: ["Education", "Work Experience"],
      uploadDate: "2023-06-15",
      preview:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80",
    },
    {
      id: "2",
      name: "Recommendation_Letter.docx",
      size: "125 KB",
      type: "application/docx",
      tags: ["Letter", "Reference"],
      criteria: ["Recommendation"],
      uploadDate: "2023-06-14",
    },
    {
      id: "3",
      name: "Publication_Evidence.pdf",
      size: "1.2 MB",
      type: "application/pdf",
      tags: ["Publication", "Evidence"],
      criteria: ["Scholarly Articles"],
      uploadDate: "2023-06-13",
      preview:
        "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400&q=80",
    },
  ],
  visaCriteria = [
    "Education",
    "Work Experience",
    "Recommendation",
    "Scholarly Articles",
    "Awards",
    "High Salary",
    "Media Coverage",
    "Memberships",
  ],
  visaType = "O-1A",
}: DocumentUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentsState, setDocumentsState] = useState<Document[]>(documents);
  const [criteriaAnalysis, setCriteriaAnalysis] = useState<
    Record<string, AICriteriaAnalysis>
  >({});
  const [isAnalyzingCriteria, setIsAnalyzingCriteria] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(
    null,
  );
  const [availableTags, setAvailableTags] = useState([
    "Resume",
    "Letter",
    "Publication",
    "Award",
    "Certificate",
    "Reference",
    "Evidence",
    "Professional",
    "Academic",
    "Media",
  ]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Update local state when documents prop changes
  useEffect(() => {
    setDocumentsState(documents);
  }, [documents]);

  // Analyze criteria coverage when documents change
  useEffect(() => {
    if (documentsState.length > 0 && visaCriteria.length > 0) {
      analyzeCriteriaCoverage();
    }
  }, [documentsState, visaCriteria]);

  // Analyze criteria coverage
  const analyzeCriteriaCoverage = async () => {
    setIsAnalyzingCriteria(true);

    try {
      const analysisResults: Record<string, AICriteriaAnalysis> = {};

      for (const criterion of visaCriteria) {
        // Find documents that are tagged with this criterion
        const documentIds = documentsState
          .filter((doc) => doc.criteria.includes(criterion))
          .map((doc) => doc.id);

        // Analyze coverage for this criterion
        const analysis = await aiService.analyzeCriteriaCoverage(
          criterion,
          documentIds,
        );
        analysisResults[criterion] = analysis;
      }

      setCriteriaAnalysis(analysisResults);
    } catch (error) {
      console.error("Error analyzing criteria coverage:", error);
    } finally {
      setIsAnalyzingCriteria(false);
    }
  };

  // Handle drop event
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onUpload(filesArray);
      await processUploadedFiles(filesArray);
    }
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onUpload(filesArray);
      await processUploadedFiles(filesArray);
    }
  };

  // Process uploaded files with AI analysis
  const processUploadedFiles = async (files: File[]) => {
    setIsAnalyzing(true);

    try {
      const newDocuments: Document[] = [];

      for (const file of files) {
        // Analyze document with AI
        const analysis = await aiService.analyzeDocument(file);

        // Create new document with AI-suggested tags and criteria
        const newDoc: Document = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          tags: analysis.tags,
          criteria: analysis.criteria,
          uploadDate: new Date().toISOString().split("T")[0],
        };

        newDocuments.push(newDoc);
      }

      // Update documents state
      const updatedDocuments = [...documentsState, ...newDocuments];
      setDocumentsState(updatedDocuments);

      // Notify parent component
      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments);
      }
    } catch (error) {
      console.error("Error analyzing documents:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Filter documents based on search term
  const filteredDocuments = documentsState.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      doc.criteria.some((criterion) =>
        criterion.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="w-full bg-background p-4 rounded-lg border">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Document Management</h2>
          <div className="flex space-x-2">
            <Input
              placeholder="Search documents..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Button
              variant="outline"
              onClick={analyzeCriteriaCoverage}
              disabled={isAnalyzingCriteria}
              className="flex items-center gap-1"
            >
              {isAnalyzingCriteria ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart2 className="h-4 w-4" />
              )}
              Analyze Coverage
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Upload Guide</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Document Upload Guidelines</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p>For best results when uploading documents:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Use PDF format when possible</li>
                    <li>Ensure documents are clearly legible</li>
                    <li>Tag documents appropriately for easier organization</li>
                    <li>Associate documents with relevant visa criteria</li>
                    <li>Maximum file size: 10MB per document</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10">
              {isAnalyzing ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {isAnalyzing
                  ? "Analyzing documents..."
                  : "Drag and drop files here"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isAnalyzing
                  ? "AI is analyzing and categorizing your documents"
                  : "or click to browse your files"}
              </p>
            </div>
            <Button
              variant="outline"
              className="relative"
              disabled={isAnalyzing}
            >
              Browse Files
              <Input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                multiple
                disabled={isAnalyzing}
              />
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOCX, JPG, PNG (Max: 10MB)
            </p>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span>
                  AI will automatically tag and categorize your documents
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Document List */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All Documents ({documentsState.length})
            </TabsTrigger>
            <TabsTrigger value="tagged">Tagged</TabsTrigger>
            <TabsTrigger value="untagged">Untagged</TabsTrigger>
            <TabsTrigger value="coverage">Criteria Coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
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
                    <CardContent className="p-4">
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
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
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
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          Criteria:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.criteria.map((criterion, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {criterion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tagged">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments
                  .filter((doc) => doc.tags.length > 0)
                  .map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
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
                      <CardContent className="p-4">
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
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <Tag className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
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

          <TabsContent value="untagged">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments
                  .filter((doc) => doc.tags.length === 0)
                  .map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
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
                      <CardContent className="p-4">
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
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <Tag className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            Add Tags
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="coverage">
            <ScrollArea className="h-[400px] pr-4">
              {isAnalyzingCriteria ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing criteria coverage...
                    </p>
                  </div>
                </div>
              ) : Object.keys(criteriaAnalysis).length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center space-y-4">
                    <BarChart2 className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No criteria analysis available. Click "Analyze Coverage"
                      to begin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {visaCriteria.map((criterion) => {
                      const analysis = criteriaAnalysis[criterion];
                      if (!analysis) return null;

                      const getStatusIcon = (coverage: number) => {
                        if (coverage >= 80)
                          return (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          );
                        if (coverage >= 40)
                          return (
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                          );
                        return <AlertCircle className="h-5 w-5 text-red-500" />;
                      };

                      const getStatusClass = (coverage: number) => {
                        if (coverage >= 80)
                          return "bg-green-50 border-green-200";
                        if (coverage >= 40)
                          return "bg-amber-50 border-amber-200";
                        return "bg-red-50 border-red-200";
                      };

                      return (
                        <Card
                          key={criterion}
                          className={`overflow-hidden ${getStatusClass(analysis.coverage)}`}
                          onClick={() =>
                            setSelectedCriterion(
                              criterion === selectedCriterion
                                ? null
                                : criterion,
                            )
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(analysis.coverage)}
                                <div>
                                  <h4 className="font-medium">{criterion}</h4>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={analysis.coverage}
                                      className="w-32 h-2"
                                    />
                                    <span className="text-xs font-medium">
                                      {analysis.coverage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  analysis.coverage >= 80
                                    ? "default"
                                    : "outline"
                                }
                                className="ml-2"
                              >
                                {analysis.documentIds.length} document
                                {analysis.documentIds.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>

                            {selectedCriterion === criterion && (
                              <div className="mt-4 space-y-3">
                                <div className="text-sm font-medium">
                                  AI Suggestions:
                                </div>
                                <ul className="space-y-2">
                                  {analysis.suggestions.map(
                                    (suggestion, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm flex items-start gap-2"
                                      >
                                        <div className="mt-0.5 flex-shrink-0">
                                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                        </div>
                                        {suggestion}
                                      </li>
                                    ),
                                  )}
                                </ul>

                                {analysis.documentIds.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-sm font-medium mb-2">
                                      Associated Documents:
                                    </div>
                                    <div className="space-y-2">
                                      {analysis.documentIds.map((docId) => {
                                        const doc = documentsState.find(
                                          (d) => d.id === docId,
                                        );
                                        if (!doc) return null;

                                        return (
                                          <div
                                            key={docId}
                                            className="flex items-center justify-between bg-background p-2 rounded-md text-sm"
                                          >
                                            <span className="truncate">
                                              {doc.name}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDocument(doc);
                                              }}
                                            >
                                              <Tag className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document Tagging Dialog */}
      {selectedDocument && (
        <Dialog
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Document Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">{selectedDocument.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.size} • {selectedDocument.uploadDate}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedDocument.tags.map((tag, i) => (
                    <Badge key={i} className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => {
                          const updatedTags = selectedDocument.tags.filter(
                            (t) => t !== tag,
                          );
                          onTagDocument(selectedDocument.id, updatedTags);
                          setSelectedDocument({
                            ...selectedDocument,
                            tags: updatedTags,
                          });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    className="flex-1"
                    id="new-tag-input"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        "new-tag-input",
                      ) as HTMLInputElement;
                      if (input && input.value && selectedDocument) {
                        const updatedTags = [
                          ...selectedDocument.tags,
                          input.value,
                        ];
                        onTagDocument(selectedDocument.id, updatedTags);
                        setSelectedDocument({
                          ...selectedDocument,
                          tags: updatedTags,
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Suggested tags:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags
                      .filter((tag) => !selectedDocument.tags.includes(tag))
                      .slice(0, 5)
                      .map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            const updatedTags = [...selectedDocument.tags, tag];
                            onTagDocument(selectedDocument.id, updatedTags);
                            setSelectedDocument({
                              ...selectedDocument,
                              tags: updatedTags,
                            });
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Visa Criteria</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedDocument.criteria.map((criterion, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {criterion}
                      <button
                        onClick={() => {
                          const updatedCriteria =
                            selectedDocument.criteria.filter(
                              (c) => c !== criterion,
                            );
                          onAssignCriteria(
                            selectedDocument.id,
                            updatedCriteria,
                          );
                          setSelectedDocument({
                            ...selectedDocument,
                            criteria: updatedCriteria,
                          });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Available criteria:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {visaCriteria
                      .filter(
                        (criterion) =>
                          !selectedDocument.criteria.includes(criterion),
                      )
                      .map((criterion, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            const updatedCriteria = [
                              ...selectedDocument.criteria,
                              criterion,
                            ];
                            onAssignCriteria(
                              selectedDocument.id,
                              updatedCriteria,
                            );
                            setSelectedDocument({
                              ...selectedDocument,
                              criteria: updatedCriteria,
                            });
                          }}
                        >
                          {criterion}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // Update the document in the local state
                  if (selectedDocument) {
                    const updatedDocuments = documentsState.map((doc) =>
                      doc.id === selectedDocument.id ? selectedDocument : doc,
                    );
                    setDocumentsState(updatedDocuments);

                    // Notify parent component
                    if (onDocumentsChange) {
                      onDocumentsChange(updatedDocuments);
                    }

                    setSelectedDocument(null);
                  }
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (selectedDocument) {
                    setIsAnalyzing(true);
                    try {
                      // Re-analyze the document with AI
                      const analysis =
                        await aiService.analyzeDocument(selectedDocument);

                      // Update with AI suggestions
                      const updatedDocument = {
                        ...selectedDocument,
                        tags: [
                          ...new Set([
                            ...selectedDocument.tags,
                            ...analysis.tags,
                          ]),
                        ],
                        criteria: [
                          ...new Set([
                            ...selectedDocument.criteria,
                            ...analysis.criteria,
                          ]),
                        ],
                      };

                      setSelectedDocument(updatedDocument);
                    } catch (error) {
                      console.error("Error analyzing document:", error);
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Analyze
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DocumentUploader;
