import React, { useState, useEffect, FC } from "react";
import { 
  Upload, 
  FileText, 
  User, 
  UserCheck, 
  Tag, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Info,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentUploader } from "./DocumentUploader";
import { EnhancedDocumentSorter } from "./EnhancedDocumentSorter";
import VisaTypeSelector from "./VisaTypeSelector";
import LetterEditor from "./LetterEditor";
import SimpleExpertSelector from "./SimpleExpertSelector";
import ExpertPreview from "./ExpertPreview";
import { aiService } from "@/services/aiService";
import { useExpertDetails, Expert } from "@/services/expertService";

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
interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  category?: string;
  tags: string[];
  criteria?: string[];
  summary?: string;
  uploadDate: string;
  publicUrl?: string;
  extractedText?: string;
  status?: "uploaded" | "processing" | "processed" | "error";
  error?: string;
}

// Step interface
interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  isCompleted: boolean;
}

// Applicant information interface
interface ApplicantInfo {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  degreeField?: string;
}

// Expert information interface
interface ExpertInfo {
  fullName: string;
  title: string;
  organization: string;
  relationship: string;
  expertId?: string;
  letterheadUrl?: string;
  signatureUrl?: string;
  introText?: string;
}

interface LetterAIWizardProps {
  onSaveLetter?: (letterContent: string, letterTitle: string) => void;
}

const LetterAIWizard: FC<LetterAIWizardProps> = ({ onSaveLetter }) => {
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // State for documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // State for applicant information
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    degreeField: ""
  });
  
  // State for expert information
  const [expertInfo, setExpertInfo] = useState<ExpertInfo>({
    fullName: "",
    title: "",
    organization: "",
    relationship: "",
    expertId: ""
  });
  
  // Get expert details when expertId changes
  const { expert } = useExpertDetails(expertInfo.expertId || null);
  
  // Update expert info when expert details are loaded
  useEffect(() => {
    if (expert) {
      setExpertInfo(prev => ({
        ...prev,
        fullName: expert.name || prev.fullName,
        title: expert.title || prev.title,
        organization: expert.organization || prev.organization,
        letterheadUrl: expert.letterheadUrl,
        signatureUrl: expert.signatureUrl,
        introText: expert.introText
      }));
    }
  }, [expert]);
  
  // State for visa type
  const [visaType, setVisaType] = useState<string>("O-1A");
  
  // State for letter content
  const [letterContent, setLetterContent] = useState<string>("");
  const [letterTitle, setLetterTitle] = useState<string>("");
  
  // State for tracking if steps are completed
  const [stepsCompleted, setStepsCompleted] = useState<{[key: number]: boolean}>({
    1: false, // Upload Documents
    2: false, // Review & Sort Documents
    3: false, // Applicant Information
    4: false, // Expert Information
    5: false, // Visa Type Selection
    6: false  // Generate Letter
  });
  
  // State for loading states
  const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
  const [isEnhancedSorterOpen, setIsEnhancedSorterOpen] = useState<boolean>(false);
  
  // Document categories
  const documentCategories = [
    { id: "resume", title: "1 - Resume", icon: "user" },
    { id: "degree", title: "2 - Degree & Diplomas", icon: "graduation-cap" },
    { id: "license", title: "3 - License & Membership", icon: "id-card" },
    { id: "employment", title: "4 - Employment Records", icon: "briefcase" },
    { id: "support", title: "5 - Support Letters", icon: "envelope" },
    { id: "recognition", title: "6 - Recognitions", icon: "award" },
    { id: "media", title: "7 - Press Media", icon: "newspaper" }
  ];
  
  // Define the steps
  const steps: Step[] = [
    {
      id: 1,
      title: "Upload Documents",
      icon: <Upload className="h-4 w-4" />,
      description: "Upload all supporting files",
      isCompleted: stepsCompleted[1]
    },
    {
      id: 2,
      title: "Review & Sort",
      icon: <FileText className="h-4 w-4" />,
      description: "Confirm document categories",
      isCompleted: stepsCompleted[2]
    },
    {
      id: 3,
      title: "Applicant Info",
      icon: <User className="h-4 w-4" />,
      description: "Fill applicant's details",
      isCompleted: stepsCompleted[3]
    },
    {
      id: 4,
      title: "Expert Info",
      icon: <UserCheck className="h-4 w-4" />,
      description: "Fill expert's details",
      isCompleted: stepsCompleted[4]
    },
    {
      id: 5,
      title: "Visa Type",
      icon: <Tag className="h-4 w-4" />,
      description: "Select visa type",
      isCompleted: stepsCompleted[5]
    },
    {
      id: 6,
      title: "Generate Letter",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Generate the letter draft",
      isCompleted: stepsCompleted[6]
    }
  ];
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const completedSteps = Object.values(stepsCompleted).filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };
  
  // Check if a step is completed
  useEffect(() => {
    // Step 1: Upload Documents
    setStepsCompleted(prev => ({
      ...prev,
      1: documents.length > 0
    }));
    
    // Step 2: Review & Sort Documents
    // Consider step 2 complete if there are documents and at least one is categorized
    const hasDocuments = documents.length > 0;
    const atLeastOneCategorized = documents.some(doc => doc.category !== undefined && doc.category !== '');
    setStepsCompleted(prev => ({
      ...prev,
      2: hasDocuments && atLeastOneCategorized
    }));
    
    // Step 3: Applicant Information
    const isApplicantInfoComplete = 
      applicantInfo.fullName.trim() !== "" && 
      applicantInfo.dateOfBirth.trim() !== "" && 
      applicantInfo.nationality.trim() !== "";
    setStepsCompleted(prev => ({
      ...prev,
      3: isApplicantInfoComplete
    }));
    
    // Step 4: Expert Information
    const isExpertInfoComplete = 
      (expertInfo.fullName.trim() !== "" && 
      expertInfo.title.trim() !== "" && 
      expertInfo.organization.trim() !== "" && 
      expertInfo.relationship.trim() !== "") ||
      expertInfo.expertId !== "";
    setStepsCompleted(prev => ({
      ...prev,
      4: isExpertInfoComplete
    }));
    
    // Step 5: Visa Type Selection
    setStepsCompleted(prev => ({
      ...prev,
      5: visaType.trim() !== ""
    }));
    
    // Step 6: Generate Letter
    setStepsCompleted(prev => ({
      ...prev,
      6: letterContent.trim() !== ""
    }));
  }, [documents, applicantInfo, expertInfo, visaType, letterContent]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    // Create document objects
    const newDocuments = files.map((file) => {
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
        tags: [],
        criteria: [],
        uploadDate: new Date().toISOString().split('T')[0],
        status: "uploaded" as const
      };
    });
    
    // Check for duplicates and only add new files
    setDocuments(prev => {
      const updatedDocs = [...prev];
      
      // Filter out duplicates based on file name
      newDocuments.forEach(newDoc => {
        // Check if a document with the same name already exists
        const isDuplicate = updatedDocs.some(existingDoc => 
          existingDoc.name === newDoc.name
        );
        
        // Only add if it's not a duplicate
        if (!isDuplicate) {
          updatedDocs.push(newDoc);
        }
      });
      
      return updatedDocs;
    });
  };
  
  // Handle document categorization
  const handleSaveCategories = (categorizedDocuments: any[]) => {
    // Map the categorized documents to our DocumentItem type
    const updatedDocuments = documents.map(doc => {
      // Find the corresponding document in categorizedDocuments
      const categorizedDoc = categorizedDocuments.find(d => d.id === doc.id);
      if (categorizedDoc) {
        // Update the category
        return {
          ...doc,
          category: categorizedDoc.category
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocuments);
    setIsEnhancedSorterOpen(false);
  };
  
  // Handle generating the letter
  const generateLetter = async () => {
    if (documents.length === 0) {
      alert("Please upload at least one document before generating a letter.");
      return;
    }
    
    setIsGeneratingLetter(true);
    
    try {
      // Prepare documents for AI service
      const processedDocs = documents.map(doc => ({
        id: doc.id,
        title: doc.name,
        description: doc.summary || "",
        type: doc.category || "",
        tags: doc.tags
      }));
      
  // Generate letter using AI service
  const result = await aiService.draftExpertLetter(
    visaType,
    { name: applicantInfo.fullName }, 
    { 
      name: expertInfo.fullName,
      title: expertInfo.title,
      organization: expertInfo.organization,
      relationship: expertInfo.relationship,
      introText: expertInfo.introText,
      letterheadUrl: expertInfo.letterheadUrl,
      signatureUrl: expertInfo.signatureUrl
    }, 
    processedDocs
  );
  
  // If we have an expert with intro text, replace the intro paragraph
  if (expertInfo.expertId && expertInfo.introText) {
    console.log("Using expert intro text:", expertInfo.introText);
    // Find the intro paragraph (usually starts with "Dear USCIS" or similar)
    const introRegex = /(Dear USCIS|To Whom It May Concern|Dear Sir or Madam|Dear Immigration Officer).*?\n\n/s;
    const introMatch = result.content.match(introRegex);
    
    if (introMatch && introMatch.index !== undefined) {
      // Replace the intro paragraph with the expert's intro text
      const beforeIntro = result.content.substring(0, introMatch.index);
      const afterIntro = result.content.substring(introMatch.index + introMatch[0].length);
      result.content = beforeIntro + expertInfo.introText + "\n\n" + afterIntro;
    }
  }
  
  // Add letterhead and signature information to the letter content if available
  if (expertInfo.letterheadUrl || expertInfo.signatureUrl) {
    let letterContent = result.content;
    
    // Add letterhead reference at the top of the letter if available
    if (expertInfo.letterheadUrl) {
      letterContent = `[LETTERHEAD: ${expertInfo.letterheadUrl}]\n\n${letterContent}`;
    }
    
    // Add signature reference before the closing if available
    if (expertInfo.signatureUrl) {
      // Find a good place to insert the signature (before "Sincerely" or similar)
      const closingRegex = /\n(Sincerely|Respectfully|Regards|Yours truly),\s*\n/i;
      const closingMatch = letterContent.match(closingRegex);
      
      if (closingMatch && closingMatch.index !== undefined) {
        const beforeClosing = letterContent.substring(0, closingMatch.index);
        const afterClosing = letterContent.substring(closingMatch.index);
        letterContent = `${beforeClosing}\n\n[SIGNATURE: ${expertInfo.signatureUrl}]${afterClosing}`;
      } else {
        // If no closing found, append at the end
        letterContent = `${letterContent}\n\n[SIGNATURE: ${expertInfo.signatureUrl}]`;
      }
    }
    
    result.content = letterContent;
  }
      
      // Update letter content
      setLetterContent(result.content);
      
      // Generate a default title if none exists
      if (!letterTitle) {
        setLetterTitle(`${visaType} Expert Letter for ${applicantInfo.fullName}`);
      }
    } catch (error) {
      console.error("Error generating letter:", error);
      alert("Failed to generate letter. Please try again.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };
  
  // Handle saving the letter
  const handleSaveLetter = () => {
    if (onSaveLetter) {
      onSaveLetter(letterContent, letterTitle);
    }
  };
  
  // Navigate to the next step
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Navigate to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Navigate to a specific step
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Upload Documents
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload Documents</h2>
            <p className="text-muted-foreground">
              Upload all supporting files for the expert letter. These documents will be used to generate the letter content.
            </p>
            
            <DocumentUploader 
              onUpload={handleFileUpload}
              documents={documents.map(doc => ({
                ...doc,
                criteria: doc.criteria || []
              }))}
              onDocumentsChange={(updatedDocs) => {
                // Convert back to our DocumentItem type
                setDocuments(updatedDocs.map(doc => ({
                  ...doc,
                  criteria: doc.criteria
                })));
              }}
              visaType={visaType}
            />
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={goToNextStep}
                disabled={!stepsCompleted[1]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 2: // Review & Sort Documents
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review & Sort Documents</h2>
            <p className="text-muted-foreground">
              Review your uploaded documents and sort them into appropriate categories.
            </p>
            
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Document Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop documents between categories to organize them.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEnhancedSorterOpen(true)}
              >
                Open Document Sorter
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentCategories.map((category) => {
                const categoryDocs = documents.filter(doc => doc.category === category.id);
                return (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{category.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {categoryDocs.length} document(s)
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categoryDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center text-sm p-2 border rounded-md">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                        ))}
                        {categoryDocs.length === 0 && (
                          <div className="text-center p-4 text-sm text-muted-foreground">
                            No documents in this category
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <EnhancedDocumentSorter
              isOpen={isEnhancedSorterOpen}
              onClose={() => setIsEnhancedSorterOpen(false)}
              documents={documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                size: doc.size,
                uploadDate: doc.uploadDate,
                category: doc.category
              }))}
              categories={documentCategories}
              onSaveCategories={handleSaveCategories}
            />
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={goToNextStep}
                disabled={!stepsCompleted[2]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 3: // Applicant Information
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Applicant Information</h2>
            <p className="text-muted-foreground">
              Provide information about the applicant for whom the expert letter is being written.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={applicantInfo.fullName}
                    onChange={(e) => setApplicantInfo({...applicantInfo, fullName: e.target.value})}
                    placeholder="Enter applicant's full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Format: MM/DD/YYYY</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <input
                    id="dateOfBirth"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={applicantInfo.dateOfBirth}
                    onChange={(e) => setApplicantInfo({...applicantInfo, dateOfBirth: e.target.value})}
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium mb-1">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nationality"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={applicantInfo.nationality}
                    onChange={(e) => setApplicantInfo({...applicantInfo, nationality: e.target.value})}
                    placeholder="Enter applicant's nationality"
                  />
                </div>
                
                <div>
                  <label htmlFor="degreeField" className="block text-sm font-medium mb-1">
                    Degree Field (Optional)
                  </label>
                  <input
                    id="degreeField"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={applicantInfo.degreeField || ""}
                    onChange={(e) => setApplicantInfo({...applicantInfo, degreeField: e.target.value})}
                    placeholder="Enter applicant's field of study"
                  />
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Information Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {applicantInfo.fullName || "Not provided"}</p>
                  <p><strong>Date of Birth:</strong> {applicantInfo.dateOfBirth || "Not provided"}</p>
                  <p><strong>Nationality:</strong> {applicantInfo.nationality || "Not provided"}</p>
                  <p><strong>Degree Field:</strong> {applicantInfo.degreeField || "Not provided"}</p>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                  <p className="font-medium">Why we need this information:</p>
                  <p className="mt-1">
                    This information is used to personalize the expert letter and ensure it accurately 
                    represents the applicant's background and qualifications.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={goToNextStep}
                disabled={!stepsCompleted[3]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 4: // Expert Information
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Expert Information</h2>
            <p className="text-muted-foreground">
              Select an expert from our database or enter custom expert information.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="expertSelector" className="block text-sm font-medium mb-1">
                      Select Expert
                    </label>
                    <SimpleExpertSelector
                      value={expertInfo.expertId || ""}
                      onChange={(value) => {
                        setExpertInfo({
                          ...expertInfo,
                          expertId: value
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="mx-4 text-xs text-muted-foreground">OR ENTER CUSTOM EXPERT INFO</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>
                  
                  <div>
                    <label htmlFor="expertName" className="block text-sm font-medium mb-1">
                      Expert Full Name {!expertInfo.expertId && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="expertName"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={expertInfo.fullName}
                      onChange={(e) => setExpertInfo({...expertInfo, fullName: e.target.value})}
                      placeholder="Enter expert's full name"
                      disabled={!!expertInfo.expertId}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expertTitle" className="block text-sm font-medium mb-1">
                      Expert Title {!expertInfo.expertId && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="expertTitle"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={expertInfo.title}
                      onChange={(e) => setExpertInfo({...expertInfo, title: e.target.value})}
                      placeholder="e.g., Professor, Director, CEO"
                      disabled={!!expertInfo.expertId}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expertOrganization" className="block text-sm font-medium mb-1">
                      Expert Organization {!expertInfo.expertId && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="expertOrganization"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={expertInfo.organization}
                      onChange={(e) => setExpertInfo({...expertInfo, organization: e.target.value})}
                      placeholder="Enter organization name"
                      disabled={!!expertInfo.expertId}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium mb-1">
                      Relationship to Applicant <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="relationship"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={expertInfo.relationship}
                      onChange={(e) => setExpertInfo({...expertInfo, relationship: e.target.value})}
                      placeholder="e.g., Mentor, Supervisor, Colleague"
                    />
                  </div>
                </div>
                
                {!expertInfo.expertId && !stepsCompleted[4] && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <p>
                      Please either select an expert from the dropdown or fill in all the required fields manually.
                    </p>
                  </div>
                )}
              </div>
              
              {expertInfo.expertId ? (
                <ExpertPreview expertId={expertInfo.expertId} />
              ) : (
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Expert Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {expertInfo.fullName || "Not provided"}</p>
                    <p><strong>Title:</strong> {expertInfo.title || "Not provided"}</p>
                    <p><strong>Organization:</strong> {expertInfo.organization || "Not provided"}</p>
                    <p><strong>Relationship:</strong> {expertInfo.relationship || "Not provided"}</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-xs">
                    <p className="font-medium">Why expert information matters:</p>
                    <p className="mt-1">
                      The expert's credentials and relationship to the applicant are crucial for establishing 
                      credibility in the letter. USCIS gives more weight to letters from recognized experts 
                      with relevant qualifications.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={goToNextStep}
                disabled={!stepsCompleted[4]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 5: // Visa Type Selection
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Visa Type Selection</h2>
            <p className="text-muted-foreground">
              Select the visa type for which the expert letter is being written.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="visaType" className="block text-sm font-medium mb-1">
                    Visa Type <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <VisaTypeSelector 
                      value={visaType}
                      onChange={setVisaType}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="letterTitle" className="block text-sm font-medium mb-1">
                    Letter Title
                  </label>
                  <input
                    id="letterTitle"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    placeholder={`${visaType} Expert Letter for ${applicantInfo.fullName}`}
                  />
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Visa Type Information</h3>
                
                <div className="space-y-4">
                  {visaType === "O-1A" && (
                    <div>
                      <h4 className="text-sm font-medium">O-1A Visa</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        For individuals with extraordinary ability in sciences, education, business, or athletics.
                      </p>
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        <li>Requires extraordinary ability in your field</li>
                        <li>Must demonstrate sustained national or international acclaim</li>
                        <li>Coming to work in your area of extraordinary ability</li>
                      </ul>
                    </div>
                  )}
                  
                  {visaType === "EB-1A" && (
                    <div>
                      <h4 className="text-sm font-medium">EB-1A Visa</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        For individuals with extraordinary ability in sciences, arts, education, business, or athletics.
                      </p>
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        <li>Self-petition (no employer sponsor required)</li>
                        <li>Must meet at least 3 of 10 criteria or provide evidence of a one-time achievement</li>
                        <li>Must demonstrate that you will continue to work in your area of expertise</li>
                      </ul>
                    </div>
                  )}
                  
                  {visaType === "EB-2 NIW" && (
                    <div>
                      <h4 className="text-sm font-medium">EB-2 NIW (National Interest Waiver)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        For individuals with exceptional ability or advanced degrees whose work is in the national interest.
                      </p>
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        <li>Waives the requirement for a job offer and labor certification</li>
                        <li>Must demonstrate exceptional ability or advanced degree</li>
                        <li>Work must be of substantial merit and national importance</li>
                        <li>Must be well positioned to advance the proposed endeavor</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-xs">
                    <p className="font-medium">Expert Letter Importance:</p>
                    <p className="mt-1">
                      Expert opinion letters are critical supporting documents for visa applications. 
                      They provide third-party validation of the applicant's qualifications and achievements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={goToNextStep}
                disabled={!stepsCompleted[5]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 6: // Generate Letter
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Generate Letter</h2>
            <p className="text-muted-foreground">
              Generate the expert letter based on the information and documents provided.
            </p>
            
            <div className="bg-muted/30 p-4 rounded-md mb-6">
              <h3 className="text-sm font-medium mb-2">Letter Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Applicant:</strong> {applicantInfo.fullName}</p>
                  <p><strong>Nationality:</strong> {applicantInfo.nationality}</p>
                  <p><strong>Visa Type:</strong> {visaType}</p>
                </div>
                <div>
                  <p><strong>Expert:</strong> {expertInfo.fullName}</p>
                  <p><strong>Title:</strong> {expertInfo.title}</p>
                  <p><strong>Organization:</strong> {expertInfo.organization}</p>
                </div>
              </div>
              <div className="mt-4">
                <p><strong>Documents:</strong> {documents.length} document(s) uploaded</p>
                {expertInfo.expertId && (
                  <p><strong>Using Expert Template:</strong> Yes (Letterhead, Signature, and Introduction)</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={generateLetter}
                disabled={isGeneratingLetter || !stepsCompleted[1] || !stepsCompleted[3] || !stepsCompleted[4] || !stepsCompleted[5]}
                className="w-64"
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
            </div>
            
            <div className="border rounded-md">
              <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                <h3 className="font-medium">Letter Preview</h3>
                <div>
                  <input
                    type="text"
                    className="px-3 py-1 border rounded-md text-sm w-64"
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    placeholder="Letter Title"
                  />
                </div>
              </div>
              <div className="p-6">
                {letterContent ? (
                  <LetterEditor
                    letterType="expert"
                    initialContent={letterContent}
                    documents={documents.map(doc => ({
                      id: doc.id,
                      name: doc.name,
                      criteria: doc.criteria || [],
                      tags: doc.tags,
                      size: doc.size,
                      type: doc.type,
                      uploadDate: doc.uploadDate
                    }))}
                    showComments={false}
                    onContentChange={setLetterContent}
                    onSave={handleSaveLetter}
                    beneficiaryInfo={{ name: applicantInfo.fullName }}
                    petitionerInfo={{ name: expertInfo.fullName }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Your letter will appear here after generation</p>
                    <p className="text-sm mt-2">
                      Click the "Generate Letter" button above to create your expert letter
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleSaveLetter}
                disabled={!letterContent}
              >
                Save Letter
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Stepper Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">LetterAI Wizard</h1>
            <p className="text-muted-foreground">
              Follow these steps to generate your expert letter
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {/* Steps */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center relative"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute top-4 h-0.5 left-1/2 right-0 -mr-4 ${
                      step.isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ width: 'calc(100% - 2rem)' }}
                  />
                )}
                
                {/* Step circle */}
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={!step.isCompleted && step.id !== currentStep}
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                      : step.isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </button>
                
                {/* Step title */}
                <div 
                  className={`mt-2 text-xs font-medium text-center ${
                    currentStep === step.id
                      ? 'text-primary'
                      : step.isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </div>
                
                {/* Step description (only show for current step) */}
                {currentStep === step.id && (
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {step.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default LetterAIWizard;
