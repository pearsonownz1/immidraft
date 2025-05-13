import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { aiService } from "@/services/aiService";
import { getCaseById, getCaseDocuments } from "@/services/caseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Edit,
  RefreshCw,
  PlusCircle,
  Download,
  CheckCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Link2,
  Save,
} from "lucide-react";

interface ExpertLetterDraftingViewProps {
  expertData?: {
    name: string;
    title: string;
    relationship: string;
    focus: string;
  };
  initialDraft?: string;
}

const ExpertLetterDraftingView: React.FC<ExpertLetterDraftingViewProps> = ({
  expertData = {
    name: "Dr. Jane Smith, PhD",
    title: "Professor of Robotics, Stanford",
    relationship: "PhD advisor (2014–2019)",
    focus: "Publications + Original Contributions",
  },
  initialDraft = "",
}) => {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  
  const [draft, setDraft] = useState(initialDraft || getDefaultDraft());
  const [isExpertPanelExpanded, setIsExpertPanelExpanded] = useState(true);
  const [isEvidencePanelExpanded, setIsEvidencePanelExpanded] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([
    "patent-11691470",
    "paper-bookbot",
    "letter-kurier",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Document categories based on the user's request
  const documentCategories = [
    { id: "doc-1", title: "1 - Resume", icon: "user" },
    { id: "doc-2", title: "2 - Degree & Diplomas", icon: "graduation-cap" },
    { id: "doc-3", title: "3 - License & Membership", icon: "id-card" },
    { id: "doc-4", title: "4 - Employment Records", icon: "briefcase" },
    { id: "doc-5", title: "5 - Support Letters", icon: "envelope" },
    { id: "doc-6", title: "6 - Recognitions", icon: "award" },
    { id: "doc-7", title: "7 - Press Media", icon: "newspaper" }
  ];
  
  // Map document types to evidence types
  const getEvidenceType = (docType: string) => {
    const typeMap: {[key: string]: string} = {
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'image': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'letter': 'letter',
      'recommendation': 'letter',
      'patent': 'patent',
      'award': 'award',
      'certificate': 'award',
      'presentation': 'presentation',
      'paper': 'paper',
      'research': 'paper'
    };
    
    return typeMap[docType.toLowerCase()] || 'document';
  };

  function getDefaultDraft() {
    return `**Specific Evidence and Achievements**

Mr. Moyer's accomplishments include the development of a patented autonomous robot drivetrain system, Patent #11691470. This innovation in robotics drivetrains enhances mobility and efficiency, representing a significant advancement in robotic technology. His research paper, "RoboBot Autonomous Library Systems," details the development and implementation of an autonomous system designed to revolutionize library automation. This work exemplifies his ability to translate complex ideas into functional, real-world applications.

Furthermore, Mr. Moyer's work has been recognized by his peers and the broader robotics community, as evidenced by the National Robotics Excellence Award. This prestigious award is a testament to his outstanding contributions and leadership in robotics. His selection as a keynote speaker at the International Robotics Conference highlights his role as a thought leader in autonomous systems.

Additionally, a recommendation letter from Lukas Kurier underscores Mr. Moyer's influential work and the impact of his contributions to the field. Mr. Kurier's letter provides a professional endorsement of Mr. Moyer's skills and achievements, further validating his status as a leading figure in technology and robotics.

**Conclusion and Endorsement**`;
  }

  const toggleExpertPanel = () => {
    setIsExpertPanelExpanded(!isExpertPanelExpanded);
  };

  const toggleEvidencePanel = () => {
    setIsEvidencePanelExpanded(!isEvidencePanelExpanded);
  };

  const toggleEvidence = (id: string) => {
    if (selectedEvidence.includes(id)) {
      setSelectedEvidence(selectedEvidence.filter((item) => item !== id));
    } else {
      setSelectedEvidence([...selectedEvidence, id]);
    }
  };

  // Fetch case data and documents when component mounts
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;
      
      try {
        // Fetch case data
        const data = await getCaseById(caseId);
        setCaseData(data);
        
        // Fetch case documents
        const docs = await getCaseDocuments(caseId);
        if (docs && docs.length > 0) {
          // Transform documents to evidence items format
          const evidenceItems = docs.map(doc => ({
            id: doc.id,
            type: getEvidenceType(doc.type || ''),
            title: doc.name || 'Untitled Document',
            description: doc.tags?.join(', ') || 'No description available',
            category: doc.criteria?.[0] || 'doc-1',
            originalDoc: doc // Keep the original document data
          }));
          
          setDocuments(evidenceItems);
          console.log('Fetched documents:', evidenceItems);
        } else {
          console.log('No documents found for this case');
        }
      } catch (error) {
        console.error('Error fetching case data:', error);
      }
    };
    
    fetchCaseData();
  }, [caseId]);
  
  // Generate initial draft with AI when case data is loaded
  useEffect(() => {
    if (caseData && !initialDraft) {
      generateDraftWithAI();
    }
  }, [caseData, initialDraft]);
  
  const generateDraftWithAI = async () => {
    if (!caseData) return;
    
    setIsLoading(true);
    try {
      const beneficiaryInfo = {
        name: `${caseData.client_first_name} ${caseData.client_last_name}`,
        field: caseData.field_of_expertise || "Technology"
      };
      
      // Prepare documents with summaries for the AI
      const enhancedDocuments = documents.map(doc => ({
        ...doc,
        // Use the summary if available, otherwise use the description
        description: doc.originalDoc?.summary || doc.description || 'No description available',
        // Include extracted text if available (limited to avoid token limits)
        extractedText: doc.originalDoc?.extracted_text 
          ? doc.originalDoc.extracted_text.substring(0, 500) + '...' 
          : undefined
      }));
      
      console.log('Generating draft with enhanced documents:', enhancedDocuments);
      
      const result = await aiService.draftExpertLetter(
        caseData.visa_type || "O-1A",
        beneficiaryInfo,
        expertData,
        enhancedDocuments
      );
      
      setDraft(result.content);
    } catch (error) {
      console.error('Error generating draft with AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const improveWithAI = async () => {
    setIsLoading(true);
    try {
      const improvedDraft = await aiService.refineLetter(
        draft,
        "Make this letter more persuasive and professional. Improve the language and structure."
      );
      setDraft(improvedDraft);
    } catch (error) {
      console.error('Error improving draft with AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateWithAI = async () => {
    generateDraftWithAI();
  };

  const exportAsPDF = () => {
    // In a real implementation, this would generate a PDF
    alert("This would generate a PDF of the letter");
  };

  const markAsFinal = () => {
    // In a real implementation, this would mark the letter as final
    alert("This would mark the letter as final");
  };

  const saveDraft = () => {
    // In a real implementation, this would save the draft
    alert("Draft saved successfully");
  };
  
  const insertEvidenceReference = useCallback(async (id: string) => {
    const evidence = documents.find((item) => item.id === id);
    if (!evidence) return;
    
    setIsLoading(true);
    try {
      const citation = await aiService.generateCitation(evidence, draft);
      setDraft(draft + "\n\n" + citation);
    } catch (error) {
      console.error('Error generating citation:', error);
      
      // Fallback to the original implementation
      let referenceText = "";
      switch (evidence.type) {
        case "patent":
          referenceText = `the patented technology (${evidence.title})`;
          break;
        case "paper":
          referenceText = `their research paper "${evidence.title.replace("Paper: ", "")}"`;
          break;
        case "letter":
          referenceText = `the recommendation from ${evidence.title.replace("Letter from ", "")}`;
          break;
        case "award":
          referenceText = `their receipt of the ${evidence.title}`;
          break;
        case "presentation":
          referenceText = `their presentation at the ${evidence.title.replace(" Presentation", "")}`;
          break;
        default:
          referenceText = evidence.title;
      }
      
      setDraft(draft + `\n\nAs evidenced by ${referenceText}, the beneficiary has demonstrated extraordinary ability in the field.`);
    } finally {
      setIsLoading(false);
    }
  }, [draft, documents]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-3">Expert Letter Drafting</h1>
            <Badge variant="outline" className="text-sm font-medium">
              O-1A Visa
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="default" size="sm" onClick={markAsFinal}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Final
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area with Expert Panel at Top */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Expert Panel (Collapsible) */}
          <div className="border-b">
            <div
              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-50"
              onClick={toggleExpertPanel}
            >
              <h2 className="text-lg font-semibold">Expert Information</h2>
              <Button variant="ghost" size="sm">
                {isExpertPanelExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isExpertPanelExpanded && (
              <div className="px-6 py-3 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold w-32">Expert:</span>
                      <span>{expertData.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold w-32">Title:</span>
                      <span>{expertData.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold w-32">Relationship:</span>
                      <span>{expertData.relationship}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold w-32">Focus:</span>
                      <span>{expertData.focus}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Main Editor Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Letter Editor (2/3 width) */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">📝 AI-Drafted Letter (Editable)</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={regenerateWithAI}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={improveWithAI}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve Draft
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-6 bg-white min-h-[600px] relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="mt-4 text-gray-500">Processing with AI...</p>
                    </div>
                  </div>
                )}
                <textarea
                  className="w-full h-full min-h-[600px] focus:outline-none resize-none text-base leading-relaxed"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Start drafting your expert letter here..."
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Evidence Sidebar (1/3 width) */}
            {isEvidencePanelExpanded && (
              <div className="w-1/3 border-l overflow-y-auto">
                <div
                  className="flex items-center justify-between px-6 py-3 border-b cursor-pointer hover:bg-gray-50"
                  onClick={toggleEvidencePanel}
                >
                  <h3 className="font-semibold">📎 Relevant Evidence</h3>
                  <Button variant="ghost" size="sm">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      documents.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-start">
                          <div className="flex items-center h-6 mr-2">
                            <input
                              type="checkbox"
                              id={`evidence-${evidence.id}`}
                              checked={selectedEvidence.includes(evidence.id)}
                              onChange={() => toggleEvidence(evidence.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor={`evidence-${evidence.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {evidence.title}
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                              {evidence.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertEvidenceReference(evidence.id)}
                            disabled={isLoading}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Insert Reference</span>
                          </Button>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        <p>No documents found for this case.</p>
                        <p className="text-sm mt-2">Upload documents in the Case Workspace to see them here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with AI Tools */}
      <footer className="border-t px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              View Templates
            </Button>
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4 mr-2" />
              Cite Regulation
            </Button>
          </div>
          <Button variant="default" size="sm" onClick={improveWithAI}>
            <Sparkles className="h-4 w-4 mr-2" />
            Ask AI to Improve Draft
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ExpertLetterDraftingView;
