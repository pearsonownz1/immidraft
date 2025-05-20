import React, { useState } from "react";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BrainCircuit,
  FileText,
  History,
  MessageSquare,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";

// Import extracted components
import CommentSection from "./letter-editor/CommentSection";
import CriteriaOutline from "./letter-editor/CriteriaOutline";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  text: string;
  timestamp: string;
}

interface Version {
  id: string;
  name: string;
  timestamp: string;
  user: string;
}

interface Criterion {
  id: string;
  title: string;
  description: string;
  status: "complete" | "partial" | "incomplete";
}

interface LetterEditorProps {
  letterType?: "petition" | "expert";
  initialContent?: string;
  criteria?: Criterion[];
  comments?: Comment[];
  versions?: Version[];
  documents?: Array<{
    id: string;
    name: string;
    criteria: string[];
    tags?: string[];
    size?: string;
    type?: string;
    uploadDate?: string;
  }>;
  beneficiaryInfo?: {
    name: string;
  };
  petitionerInfo?: {
    name: string;
  };
  showComments?: boolean;
  visaType?: string; // Added visaType to props
}

const LetterEditor = ({
  letterType = "petition",
  visaType: propsVisaType, // Renamed to avoid conflict with local variable
  initialContent = "Start drafting your letter here...",
  criteria = [
    {
      id: "1",
      title: "Extraordinary Ability",
      description: "Evidence of extraordinary ability in the field",
      status: "partial",
    },
    {
      id: "2",
      title: "Sustained Recognition",
      description:
        "Evidence of sustained national or international recognition",
      status: "complete",
    },
    {
      id: "3",
      title: "Comparable Evidence",
      description: "Other comparable evidence if criteria do not apply",
      status: "incomplete",
    },
  ],
  comments = [
    {
      id: "1",
      user: {
        name: "Jane Smith",
        initials: "JS",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
      text: "Please strengthen the language around the applicant's awards section.",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      user: {
        name: "Mark Johnson",
        initials: "MJ",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
      },
      text: "We need to cite the specific regulation for this criterion.",
      timestamp: "1 day ago",
    },
  ],
  versions = [
    {
      id: "1",
      name: "Initial Draft",
      timestamp: "2023-06-15 10:30 AM",
      user: "Jane Smith",
    },
    {
      id: "2",
      name: "Revised Draft",
      timestamp: "2023-06-16 2:45 PM",
      user: "Mark Johnson",
    },
    {
      id: "3",
      name: "Final Draft",
      timestamp: "2023-06-17 9:15 AM",
      user: "You",
    },
  ],
  documents = [],
  beneficiaryInfo = { name: "" },
  petitionerInfo = { name: "" },
  showComments = true,
}: LetterEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("editor");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [selectedContentType, setSelectedContentType] = useState<
    "citation" | "analysis"
  >("citation");
  const [isGeneratingInsert, setIsGeneratingInsert] = useState(false);
  const [insertError, setInsertError] = useState<string | null>(null);
  const [generatedInsertContent, setGeneratedInsertContent] =
    useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const handleGenerateContent = async () => {
    setIsAIGenerating(true);
    setError(null);

    try {
      // Use data from props
      const currentVisaType = propsVisaType || (letterType === "petition" ? "O-1A" : "Expert Opinion");
      // Use actual documents from props
      const documentsList = documents || [];

      let result;
      if (letterType === "petition") {
        result = await aiService.draftPetitionLetter(
          currentVisaType, // Pass the correct visaType
          beneficiaryInfo,
          petitionerInfo,
          documentsList,
        );
      } else {
        // For expert letters, visaType might not be as directly relevant for the intro,
        // but we pass it along for consistency or future use by the AI service.
        // The aiService.draftExpertLetter might use it to tailor certain phrases if needed.
        result = await aiService.draftExpertLetter(
          currentVisaType, // Pass the correct visaType
          beneficiaryInfo,
          documentsList,
        );
      }

      setContent(result.content);
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleRefineContent = async () => {
    if (!content.trim()) {
      setError("Please add some content before refining.");
      return;
    }

    setIsAIGenerating(true);
    setError(null);

    try {
      const instructions =
        "Improve language, structure, and persuasiveness while maintaining key points";
      const refinedContent = await aiService.refineLetter(
        content,
        instructions,
      );
      setContent(refinedContent);
    } catch (err) {
      console.error("Error refining content:", err);
      setError("Failed to refine content. Please try again.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleInsertContent = () => {
    // Reset state when opening the dialog
    setSelectedCriterion("");
    setSelectedDocument("");
    setSelectedContentType("citation");
    setGeneratedInsertContent("");
    setInsertError(null);
    setDialogOpen(true);

    // If there are no documents, show an error
    if (!documents || documents.length === 0) {
      setInsertError("No documents available. Please upload documents first.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {letterType === "petition"
              ? "Petition Letter"
              : "Expert Opinion Letter"}
          </h2>
          <Badge variant="outline" className="ml-2">
            {propsVisaType || (letterType === "petition" ? "O-1A" : "Expert Opinion")}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue={letterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select letter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petition">Petition Letter</SelectItem>
              <SelectItem value="expert">Expert Opinion</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultValue="editor"
            className="flex-1 flex flex-col"
            onValueChange={setActiveTab}
          >
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger
                  value="editor"
                  className="data-[state=active]:bg-background"
                >
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-background"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="bg-muted/30 p-2 border-b flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateContent}
                          disabled={isAIGenerating}
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate content using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefineContent}
                          disabled={isAIGenerating}
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Refine
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refine existing content</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleInsertContent}
                        >
                          <BrainCircuit className="h-4 w-4 mr-1" />
                          Insert
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Insert content based on evidence</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Separator orientation="vertical" className="h-6" />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowCommentsPanel(!showCommentsPanel)
                          }
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comments
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle comments panel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <History className="h-4 w-4 mr-1" />
                              History
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Version History</h4>
                              <Separator />
                              {versions.map((version) => (
                                <div
                                  key={version.id}
                                  className="flex justify-between items-center text-sm py-1 hover:bg-muted/50 rounded px-2 cursor-pointer"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {version.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {version.timestamp} by {version.user}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View version history</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex-1 overflow-hidden">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-full min-h-[500px] rounded-none border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {isAIGenerating && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-pulse flex items-center space-x-2">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        <span className="text-lg font-medium">
                          AI is generating content...
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        This may take a few moments
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-4 right-4 bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md">
                    {error}
                    <button
                      className="ml-2 text-xs underline"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm border rounded-md">
                <h1 className="text-2xl font-bold mb-6">
                  {letterType === "petition"
                    ? "Petition Letter"
                    : "Expert Opinion Letter"}
                </h1>
                <div className="prose prose-sm">
                  {content.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-4">
                      {paragraph || <br />}
                    </p>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {showCommentsPanel && activeTab === "editor" && (
          <CommentSection comments={comments} />
        )}

        {activeTab === "editor" && showCommentsPanel && (
          <CriteriaOutline
            criteria={criteria}
            onGenerateForCriterion={(criterionId) => {
              // Find the criterion and open the insert dialog with it pre-selected
              setSelectedCriterion(criterionId);
              handleInsertContent();
            }}
          />
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setInsertError(null);
            setGeneratedInsertContent("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Insert Content from Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Criterion</h4>
              <Select
                value={selectedCriterion}
                onValueChange={(value) => {
                  setSelectedCriterion(value);
                  // Reset selected document when criterion changes
                  setSelectedDocument("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a criterion" />
                </SelectTrigger>
                <SelectContent>
                  {criteria.map((criterion) => (
                    <SelectItem key={criterion.id} value={criterion.id}>
                      {criterion.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Evidence</h4>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose evidence document" />
                </SelectTrigger>
                <SelectContent>
                  {documents && documents.length > 0 ? (
                    // Filter documents based on selected criterion
                    documents
                      .filter((doc) => {
                        // If no criterion is selected, show all documents
                        if (!selectedCriterion) return true;

                        // Find the criterion title for better matching
                        const criterionTitle =
                          criteria.find((c) => c.id === selectedCriterion)
                            ?.title || "";

                        // Check if document has criteria that match the selected criterion
                        return (
                          doc.criteria &&
                          (doc.criteria.includes(criterionTitle) ||
                            doc.criteria.some((c) =>
                              c
                                .toLowerCase()
                                .includes(criterionTitle.toLowerCase()),
                            ) ||
                            criterionTitle
                              .toLowerCase()
                              .includes(
                                doc.criteria.some((c) => c.toLowerCase()),
                              ))
                        );
                      })
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-docs">
                      No documents available
                    </SelectItem>
                  )}
                  {documents &&
                    documents.length > 0 &&
                    selectedCriterion &&
                    !documents.some((doc) => {
                      const criterionTitle =
                        criteria.find((c) => c.id === selectedCriterion)
                          ?.title || "";
                      return (
                        doc.criteria &&
                        (doc.criteria.includes(criterionTitle) ||
                          doc.criteria.some((c) =>
                            c
                              .toLowerCase()
                              .includes(criterionTitle.toLowerCase()),
                          ) ||
                          criterionTitle
                            .toLowerCase()
                            .includes(
                              doc.criteria.some((c) => c.toLowerCase()),
                            ))
                      );
                    }) && (
                      <SelectItem value="no-matching-docs">
                        No documents match this criterion
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Content Type</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={
                    selectedContentType === "citation" ? "default" : "outline"
                  }
                  className="justify-start"
                  onClick={() => setSelectedContentType("citation")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Citation
                </Button>
                <Button
                  variant={
                    selectedContentType === "analysis" ? "default" : "outline"
                  }
                  className="justify-start"
                  onClick={() => setSelectedContentType("analysis")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analysis
                </Button>
              </div>
            </div>

            {generatedInsertContent && (
              <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                <h4 className="text-sm font-medium">Generated Content</h4>
                <p className="text-sm">{generatedInsertContent}</p>
              </div>
            )}

            {insertError && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md text-sm">
                {insertError}
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {!generatedInsertContent ? (
                <Button
                  onClick={async () => {
                    if (!selectedCriterion || !selectedDocument) {
                      setInsertError(
                        "Please select both a criterion and a document",
                      );
                      return;
                    }

                    setIsGeneratingInsert(true);
                    setInsertError(null);

                    try {
                      const criterionTitle =
                        criteria.find((c) => c.id === selectedCriterion)
                          ?.title || "";

                      // Find the selected document from the documents array
                      const selectedDocObj = documents?.find(
                        (doc) => doc.id === selectedDocument,
                      );
                      const documentName =
                        selectedDocObj?.name || selectedDocument;

                      // Use the aiService to generate content based on the selected criterion and document
                      let generatedContent = "";

                      if (selectedContentType === "citation") {
                        // For citations, we'll use a simpler approach
                        generatedContent = `As evidenced by [Exhibit: ${documentName}], the beneficiary meets the criterion for ${criterionTitle}.`;
                      } else {
                        // For analysis, we'll use the refineLetter method to generate more detailed content
                        const instructions = `Generate a detailed analysis of how the document '${documentName}' supports the '${criterionTitle}' criterion.`;
                        generatedContent = await aiService.refineLetter(
                          `The document '${documentName}' provides evidence for the '${criterionTitle}' criterion.`,
                          instructions,
                        );
                      }

                      setGeneratedInsertContent(generatedContent);
                    } catch (err) {
                      console.error("Error generating insert content:", err);
                      setInsertError(
                        "Failed to generate content. Please try again.",
                      );
                    } finally {
                      setIsGeneratingInsert(false);
                    }
                  }}
                  disabled={isGeneratingInsert}
                >
                  {isGeneratingInsert ? (
                    <>
                      <span className="mr-2">Generating</span>
                      <span className="animate-spin">⟳</span>
                    </>
                  ) : (
                    "Generate Content"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Insert the generated content into the editor
                    const textArea = document.querySelector(
                      "textarea",
                    ) as HTMLTextAreaElement;

                    if (textArea) {
                      const cursorPosition = textArea.selectionStart;
                      const textBefore = content.substring(0, cursorPosition);
                      const textAfter = content.substring(cursorPosition);

                      // Insert at cursor position
                      setContent(
                        textBefore + generatedInsertContent + textAfter,
                      );

                      // After state update, we need to restore cursor position after the inserted content
                      setTimeout(() => {
                        textArea.focus();
                        const newPosition =
                          cursorPosition + generatedInsertContent.length;
                        textArea.setSelectionRange(newPosition, newPosition);
                      }, 0);
                    } else {
                      // Fallback to appending at the end if textarea not found
                      setContent(
                        (prev) => prev + "\n\n" + generatedInsertContent,
                      );
                    }

                    setDialogOpen(false);
                  }}
                >
                  Insert Content
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LetterEditor;
