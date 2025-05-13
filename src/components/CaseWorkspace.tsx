import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCaseById, getCaseDocuments, addDocumentToCase } from "@/services/caseService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CriteriaDocumentUploader } from "@/components/CriteriaDocumentUploader";
import {
  FileText,
  Search,
  Eye,
  MoreVertical,
  ChevronDown,
  Play,
  Download,
  Clock,
  Edit,
  Paperclip,
} from "lucide-react";

interface CaseWorkspaceProps {
  caseData?: any;
}

// Document interface
interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  file?: File;
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  criterionId: string;
  extracted_text?: string;
  summary?: string;
  ai_tags?: string[];
}

const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({ caseData: initialCaseData = {} }) => {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const navigate = useNavigate();
  
  console.log('URL params:', params);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);
  const [caseData, setCaseData] = useState<any>(initialCaseData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);

  // Fetch case data and documents
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const fetchCaseData = async () => {
      if (!caseId) {
        console.log('No caseId provided');
        return;
      }
      
      console.log('Fetching case data for ID:', caseId);
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch case data
        const fetchedCase = await getCaseById(caseId);
        
        // Fetch case documents
        const fetchedDocuments = await getCaseDocuments(caseId);
        
        console.log('Fetched case data:', fetchedCase);
        console.log('Fetched documents:', fetchedDocuments);
        
        // Only update state if the component is still mounted
        if (isMounted) {
          if (fetchedCase) {
            setCaseData(fetchedCase);
            
            // Convert API documents to our Document format
            if (fetchedDocuments && fetchedDocuments.length > 0) {
              const formattedDocs = fetchedDocuments.map(doc => ({
                id: doc.id,
                title: doc.name || '',
                description: doc.tags?.join(', ') || '',
                type: doc.type || 'other',
                fileName: doc.name,
                fileSize: doc.size,
                uploadDate: doc.created_at ? (
                // Validate the date before calling toISOString()
                (() => {
                  const date = new Date(doc.created_at);
                  return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                })()
              ) : new Date().toISOString().split('T')[0],
                criterionId: doc.criteria?.[0] || '',
                extracted_text: doc.extracted_text || '',
                summary: doc.summary || '',
                ai_tags: doc.ai_tags || []
              }));
              
              setDocuments(formattedDocs);
            }
            
            // Store the case data in sessionStorage for faster access on page refresh
            try {
              sessionStorage.setItem(`case_${caseId}`, JSON.stringify(fetchedCase));
            } catch (storageErr) {
              console.warn('Failed to store case data in sessionStorage:', storageErr);
            }
          } else {
            console.error('Case not found for ID:', caseId);
            setError(`Case not found with ID: ${caseId}`);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching case:', err);
        // Only update state if the component is still mounted
        if (isMounted) {
          setError('Failed to load case data');
          setIsLoading(false);
        }
      }
    };

    // Log initial state
    console.log('CaseWorkspace initializing with:', { 
      caseId, 
      hasInitialData: Object.keys(initialCaseData).length > 0 
    });

    // Try to get case data from sessionStorage first
    if (Object.keys(initialCaseData).length === 0 && caseId) {
      try {
        const storedCaseData = sessionStorage.getItem(`case_${caseId}`);
        if (storedCaseData) {
          console.log('Using cached case data from sessionStorage');
          setCaseData(JSON.parse(storedCaseData));
          
          // Still fetch documents from API
          fetchCaseData();
        } else {
          // No cached data, fetch from API
          fetchCaseData();
        }
      } catch (storageErr) {
        console.warn('Failed to retrieve case data from sessionStorage:', storageErr);
        // Fallback to API fetch
        fetchCaseData();
      }
    } else if (Object.keys(initialCaseData).length > 0) {
      console.log('Using initial case data:', initialCaseData);
      setCaseData(initialCaseData);
      
      // Still fetch documents from API if we have a caseId
      if (caseId) {
        getCaseDocuments(caseId).then(fetchedDocuments => {
          if (fetchedDocuments && fetchedDocuments.length > 0) {
            const formattedDocs = fetchedDocuments.map(doc => ({
              id: doc.id,
              title: doc.name || '',
              description: doc.tags?.join(', ') || '',
              type: doc.type || 'other',
              fileName: doc.name,
              fileSize: doc.size,
              uploadDate: doc.created_at ? (
                // Validate the date before calling toISOString()
                (() => {
                  const date = new Date(doc.created_at);
                  return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                })()
              ) : new Date().toISOString().split('T')[0],
              criterionId: doc.criteria?.[0] || '',
              extracted_text: doc.extracted_text || '',
              summary: doc.summary || '',
              ai_tags: doc.ai_tags || []
            }));
            
            setDocuments(formattedDocs);
          }
        });
      }
      
      setIsLoading(false);
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [caseId]); // Remove initialCaseData from dependencies to prevent re-fetching

  // Document management functions with database persistence
  const handleAddDocument = useCallback(async (document: Document) => {
    if (!caseId) return;
    
    try {
      let fileUrl = '';
      
      // If there's a file, upload it to Supabase storage first
      if (document.file) {
        // Ensure the documents bucket exists
        const { ensureDocumentsBucketExists } = await import('@/lib/supabase');
        const bucketExists = await ensureDocumentsBucketExists();
        
        if (!bucketExists) {
          throw new Error("Failed to create storage bucket. Please try again.");
        }
        
        // Upload file to Supabase Storage
        const fileExt = document.fileName?.split('.').pop() || '';
        const filePath = `${caseId}/${document.id}.${fileExt}`;
        
        const { supabase } = await import('@/lib/supabase');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, document.file);
        
        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        fileUrl = urlData.publicUrl;
      }
      
      // Save to database with the file URL
      const savedDoc = await addDocumentToCase(caseId, {
        name: document.title,
        type: document.type,
        size: document.fileSize || '0',
        url: fileUrl || document.title, // Use the Supabase storage URL if available
        tags: [document.description],
        criteria: [document.criterionId]
      });
      
      if (savedDoc) {
        // Update local state with the saved document
        const formattedDoc = {
          id: savedDoc.id,
          title: savedDoc.name || '',
          description: savedDoc.tags?.join(', ') || '',
          type: savedDoc.type || 'other',
          fileName: savedDoc.name,
          fileSize: savedDoc.size,
          uploadDate: savedDoc.created_at ? (
            // Validate the date before calling toISOString()
            (() => {
              const date = new Date(savedDoc.created_at);
              return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            })()
          ) : new Date().toISOString().split('T')[0],
          criterionId: savedDoc.criteria?.[0] || '',
          extracted_text: savedDoc.extracted_text || '',
          summary: savedDoc.summary || '',
          ai_tags: savedDoc.ai_tags || [],
          file: document.file // Keep the file reference for UI purposes
        };
        
        setDocuments(prevDocuments => [...prevDocuments, formattedDoc]);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      // Still update local state even if save fails
      setDocuments(prevDocuments => [...prevDocuments, document]);
    }
  }, [caseId]);
  
  const handleUpdateDocument = useCallback(async (updatedDocument: Document) => {
    if (!caseId) return;
    
    try {
      // Update in database
      // Note: This would require an additional function in caseService.ts
      // For now, we'll just update the local state
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => 
          doc.id === updatedDocument.id ? updatedDocument : doc
        )
      );
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }, [caseId]);
  
  const handleDeleteDocument = useCallback(async (documentId: string) => {
    if (!caseId) return;
    
    try {
      // Delete from database
      // Note: This would require an additional function in caseService.ts
      // For now, we'll just update the local state
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentId)
      );
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }, [caseId]);
  
  const getDocumentsForCriterion = useCallback((criterionId: string) => {
    return documents.filter(doc => doc.criterionId === criterionId);
  }, [documents]);

  const toggleDetails = (id: string) => {
    if (expandedDetails.includes(id)) {
      setExpandedDetails(expandedDetails.filter(item => item !== id));
    } else {
      setExpandedDetails([...expandedDetails, id]);
    }
  };
  
  const handleCriterionClick = (criterionId: string) => {
    setActiveCriterion(criterionId);
  };

  // Mock data for the workspace
  const beneficiaryName = caseData.beneficiary_name || "Lukas Kurier";
  const visaType = caseData.visa_type || "O-1A / Extraordinary Ability Visa";
  
  // Document categories
  const documentCategories = [
    { id: "doc-1", title: "1 - Resume", icon: "user" },
    { id: "doc-2", title: "2 - Degree & Diplomas", icon: "graduation-cap" },
    { id: "doc-3", title: "3 - License & Membership", icon: "id-card" },
    { id: "doc-4", title: "4 - Employment Records", icon: "briefcase" },
    { id: "doc-5", title: "5 - Support Letters", icon: "envelope" },
    { id: "doc-6", title: "6 - Recognitions", icon: "award" },
    { id: "doc-7", title: "7 - Press Media", icon: "newspaper" }
  ];

  const exhibits = [
    {
      id: "ex-1",
      type: "letter",
      title: "Letter of Recommendation - Lukas Kurier Robotics Expert (Google VP Kester)",
      description: "Demonstrates original contributions of major significance through the development of the revolutionary BookBot autonomous library system and a patented robot drivetrain technology that has been widely adopted across the industry, as attested by Google's Vice President of Robotics Engineering who details the impact of these innovations on autonomous robotics and last-mile delivery capabilities.",
    },
    {
      id: "ex-2",
      type: "letter",
      title: "Letter of Recommendation - James Hamilton, Principal Investor Shell Ventures (Kurier EB1)",
      description: "Demonstrates original contributions of major significance through leadership of innovative technology initiatives, including founding Parcelbot which has gained substantial industry recognition and investment in autonomous delivery systems, and spearheading Google's BookBot project that provided novel solutions for library automation.",
    },
    {
      id: "ex-3",
      type: "patent",
      title: "Patent Record - Kurier Autonomous Robot Drivetrain (USPTO 11691470)",
      description: "Demonstrates an original scientific contribution through the successful grant of US Patent #11691470 for a novel autonomous robot drivetrain system, though additional evidence would be needed to establish the major significance of this technological innovation in the field of robotics.",
    }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading case data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-md">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
          <div className="mt-4">
            <Link to="/dashboard">
              <Button 
                variant="outline"
                className="mr-2"
              >
                Return to Dashboard
              </Button>
            </Link>
            <Button 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-3">{beneficiaryName}</h1>
            <Badge variant="outline" className="text-sm font-medium">
              {visaType}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Eye className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-transparent border-b w-full justify-start h-10 p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-10 px-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="letters"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-10 px-4"
            >
              Letters
            </TabsTrigger>
            <TabsTrigger
              value="exhibits"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-10 px-4"
            >
              Exhibits
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r overflow-y-auto p-4 bg-gray-50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Documents</h2>
            <div className="space-y-2">
              {documentCategories.map(category => (
                <div 
                  key={category.id} 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer ${
                    activeCriterion === category.id ? 'bg-gray-100 border-l-4 border-primary' : ''
                  }`}
                  onClick={() => handleCriterionClick(category.id)}
                >
                  <div className="flex items-center justify-center mr-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <span className="text-sm">{category.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Attorney Petition</h2>
                <p className="text-sm text-gray-500">
                  Manage exhibits and review supporting evidence for relevant criteria to inform the draft petition.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Request Research
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Outline
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Latest Versions
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center bg-black text-white hover:bg-gray-800"
                  onClick={() => navigate(`/case/${caseId}/letter`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Draft Expert Letter
                </Button>
              </div>
            </div>

            {/* Document Uploaders */}
            {activeCriterion ? (
              // Find the active document category
              (() => {
                const activeDocCategory = documentCategories.find(category => category.id === activeCriterion);
                
                if (!activeDocCategory) return (
                  <div className="text-center p-12 text-gray-500">
                    Please select a document category from the sidebar
                  </div>
                );
                
                return (
                  <CriteriaDocumentUploader
                    key={activeDocCategory.id}
                    criterionId={activeDocCategory.id}
                    criterionTitle={activeDocCategory.title}
                    documents={getDocumentsForCriterion(activeDocCategory.id)}
                    onDocumentsChange={(docs) => {
                      console.log(`Documents changed for ${activeDocCategory.title}:`, docs);
                    }}
                    onAddDocument={(document) => {
                      const docWithCriterion = {
                        ...document,
                        criterionId: activeDocCategory.id
                      };
                      handleAddDocument(docWithCriterion);
                    }}
                    onUpdateDocument={handleUpdateDocument}
                    onDeleteDocument={handleDeleteDocument}
                  />
                );
              })()
            ) : (
              <div className="text-center p-12 text-gray-500">
                Please select a document category from the sidebar to manage documents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseWorkspace;
