import React, { useState, useEffect } from "react";
import { createCase } from "@/services/caseService";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  CheckCircle,
  Globe,
  Award,
  Menu,
  X,
  User,
  FileUp,
  PenTool,
  Briefcase,
  GraduationCap,
  FileCheck,
  Shield,
} from "lucide-react";
import { DocumentUploader } from "./DocumentUploader";
import CriteriaTracker from "./CriteriaTracker";

interface CaseBuilderProps {
  initialStep?: number;
  onSave?: (data: any) => void;
}

const CaseBuilder = ({
  initialStep = 0,
  onSave = () => {},
}: CaseBuilderProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Initialize nav collapsed state from localStorage or default to false
  const [navCollapsed, setNavCollapsed] = useState(() => {
    const savedState = localStorage.getItem('caseBuilderNavCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Update localStorage when nav collapsed state changes
  useEffect(() => {
    localStorage.setItem('caseBuilderNavCollapsed', JSON.stringify(navCollapsed));
  }, [navCollapsed]);
  const [formData, setFormData] = useState({
    clientInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
    },
    visaType: "",
    petitionDetails: {
      beneficiaryName: "",
      petitionerName: "",
      jobTitle: "",
      jobDescription: "",
    },
    documents: [],
  });

  const [caseDocuments, setCaseDocuments] = useState([]);

  const steps = [
    {
      id: "client-info",
      title: "Client Information",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "visa-selection",
      title: "Visa Selection",
      icon: <Award className="h-4 w-4" />,
    },
    {
      id: "petition-details",
      title: "Petition Details",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "document-upload",
      title: "Document Upload",
      icon: <FileUp className="h-4 w-4" />,
    }
  ];

  const visaTypes = [
    { value: "o1a", label: "O-1A (Extraordinary Ability)" },
    { value: "o1b", label: "O-1B (Extraordinary Achievement)" },
    { value: "eb1a", label: "EB-1A (Extraordinary Ability)" },
    { value: "eb1b", label: "EB-1B (Outstanding Professor/Researcher)" },
    { value: "eb1c", label: "EB-1C (Multinational Manager/Executive)" },
    { value: "eb2niw", label: "EB-2 NIW (National Interest Waiver)" },
    { value: "l1a", label: "L-1A (Intracompany Transferee Manager/Executive)" },
    {
      value: "l1b",
      label: "L-1B (Intracompany Transferee Specialized Knowledge)",
    },
    { value: "h1b", label: "H-1B (Specialty Occupation)" },
    { value: "tn", label: "TN (NAFTA Professional)" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(((currentStep + 1) / (steps.length - 1)) * 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(((currentStep - 1) / (steps.length - 1)) * 100);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section as keyof typeof formData] as Record<string, any>),
        [field]: value,
      },
    });
  };

  const handleVisaTypeChange = (value: string) => {
    setFormData({
      ...formData,
      visaType: value,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Format the data for Supabase
      const caseData = {
        client_first_name: formData.clientInfo.firstName,
        client_last_name: formData.clientInfo.lastName,
        client_email: formData.clientInfo.email,
        client_phone: formData.clientInfo.phone,
        client_company: formData.clientInfo.company,
        visa_type: formData.visaType,
        status: 'Draft',
        beneficiary_name: formData.petitionDetails.beneficiaryName,
        petitioner_name: formData.petitionDetails.petitionerName,
        job_title: formData.petitionDetails.jobTitle,
        job_description: formData.petitionDetails.jobDescription
      };
      
      // Save to Supabase
      const savedCase = await createCase(caseData);
      
      if (savedCase) {
        // Call the onSave callback with the saved case
        onSave(savedCase);
        return savedCase.id;
      } else {
        throw new Error('Failed to save case');
      }
    } catch (error) {
      console.error('Error saving case:', error);
      setSaveError(error instanceof Error ? error.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNav = () => {
    setNavCollapsed(!navCollapsed);
  };

  // Main component render

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="w-full px-12 py-6">
        <div className="flex justify-end mb-2">
          <Button variant="outline" onClick={handleSave} className="bg-white">
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
        </div>

        <div className="flex gap-8 px-8">
          {/* Left sidebar with vertical progress and steps */}
          <div
            className={`${navCollapsed ? "w-20" : "w-72"} transition-all duration-300 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              {!navCollapsed && (
                <h2 className="text-sm font-medium text-gray-500">
                  Application Steps
                </h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full ml-auto"
                onClick={toggleNav}
              >
                {navCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {steps.map((step, index) => {
                  // Calculate if this step is before the current vertical progress line
                  const stepProgress = (index / (steps.length - 1)) * 100;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex items-center relative">
                        {/* Vertical progress line */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-4 top-[32px] w-[2px] h-[calc(100%-16px)] bg-gray-200">
                            {stepProgress <=
                              (currentStep / (steps.length - 1)) * 100 && (
                              <div
                                className="absolute top-0 left-0 w-full bg-primary"
                                style={{
                                  height: `${Math.min(100, ((currentStep - index) / 1) * 100)}%`,
                                }}
                              />
                            )}
                          </div>
                        )}

                        <button
                          className={`flex items-center ${navCollapsed ? "justify-center" : "px-3"} py-3 rounded-md w-full ${isCurrent ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                          onClick={() => setCurrentStep(index)}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? "bg-primary text-white" : isCompleted ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              step.icon || (
                                <span className="text-xs">{index + 1}</span>
                              )
                            )}
                          </div>

                          {!navCollapsed && (
                            <span
                              className={`ml-3 text-sm ${isCurrent ? "font-medium" : ""}`}
                            >
                              {step.title}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center justify-between text-sm mb-1">
                {!navCollapsed && (
                  <span className="text-gray-500">Progress</span>
                )}
                <span className="font-medium ml-auto">
                  {Math.round((currentStep / (steps.length - 1)) * 100)}%
                </span>
              </div>
              <Progress
                value={(currentStep / (steps.length - 1)) * 100}
                className="h-2"
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 max-w-none">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {currentStep === 0 && (
                <div className="p-10">
                  <h2 className="text-xl font-semibold mb-1">
                    Client Information
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Enter the client's basic information
                  </p>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.clientInfo.firstName}
                          onChange={(e) =>
                            handleInputChange(
                              "clientInfo",
                              "firstName",
                              e.target.value,
                            )
                          }
                          className="border-gray-200 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.clientInfo.lastName}
                          onChange={(e) =>
                            handleInputChange(
                              "clientInfo",
                              "lastName",
                              e.target.value,
                            )
                          }
                          className="border-gray-200 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.clientInfo.email}
                        onChange={(e) =>
                          handleInputChange(
                            "clientInfo",
                            "email",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.clientInfo.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "clientInfo",
                            "phone",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        value={formData.clientInfo.company}
                        onChange={(e) =>
                          handleInputChange(
                            "clientInfo",
                            "company",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="p-10">
                  <h2 className="text-xl font-semibold mb-1">Visa Selection</h2>
                  <p className="text-muted-foreground mb-6">
                    Select the visa category for this petition
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="visa-type">Visa Type</Label>
                      <Select
                        value={formData.visaType}
                        onValueChange={handleVisaTypeChange}
                      >
                        <SelectTrigger id="visa-type" className="border-gray-200 focus:border-primary">
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                        <SelectContent>
                          {visaTypes.map((visa) => (
                            <SelectItem key={visa.value} value={visa.value}>
                              {visa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.visaType && (
                      <div className="bg-muted/50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-base font-medium mb-2">
                          {
                            visaTypes.find((v) => v.value === formData.visaType)
                              ?.label
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formData.visaType === "o1a" &&
                            "For individuals with extraordinary ability in sciences, education, business, or athletics."}
                          {formData.visaType === "o1b" &&
                            "For individuals with extraordinary ability in arts or extraordinary achievement in motion picture/television industry."}
                          {formData.visaType === "eb1a" &&
                            "For foreign nationals with extraordinary ability in sciences, arts, education, business, or athletics."}
                          {formData.visaType === "eb1b" &&
                            "For outstanding professors and researchers with international recognition."}
                          {formData.visaType === "eb1c" &&
                            "For multinational managers or executives transferring to the US."}
                          {formData.visaType === "eb2niw" &&
                            "For individuals whose work is in the national interest of the United States."}
                          {formData.visaType === "l1a" &&
                            "For executives or managers transferring to a US office of the same employer."}
                          {formData.visaType === "l1b" &&
                            "For employees with specialized knowledge transferring to a US office."}
                          {formData.visaType === "h1b" &&
                            "For workers in specialty occupations that require theoretical or technical expertise."}
                          {formData.visaType === "tn" &&
                            "For Canadian and Mexican citizens working in specific professional occupations."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="p-10">
                  <h2 className="text-xl font-semibold mb-1">
                    Petition Details
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Enter specific details for the petition
                  </p>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryName">
                        Beneficiary Full Name
                      </Label>
                      <Input
                        id="beneficiaryName"
                        value={formData.petitionDetails.beneficiaryName}
                        onChange={(e) =>
                          handleInputChange(
                            "petitionDetails",
                            "beneficiaryName",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="petitionerName">
                        Petitioner Name (Company/Individual)
                      </Label>
                      <Input
                        id="petitionerName"
                        value={formData.petitionDetails.petitionerName}
                        onChange={(e) =>
                          handleInputChange(
                            "petitionDetails",
                            "petitionerName",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title/Position</Label>
                      <Input
                        id="jobTitle"
                        value={formData.petitionDetails.jobTitle}
                        onChange={(e) =>
                          handleInputChange(
                            "petitionDetails",
                            "jobTitle",
                            e.target.value,
                          )
                        }
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <textarea
                        id="jobDescription"
                        className="w-full min-h-[100px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={formData.petitionDetails.jobDescription}
                        onChange={(e) =>
                          handleInputChange(
                            "petitionDetails",
                            "jobDescription",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="p-10">
                  <h2 className="text-xl font-semibold mb-1">
                    Document Upload
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Upload and categorize supporting documents
                  </p>
                  <DocumentUploader
                    documents={caseDocuments}
                    onDocumentsChange={(updatedDocs) =>
                      setCaseDocuments(updatedDocs)
                    }
                  />
                  
                  {saveError && (
                    <div className="mt-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                      {saveError}
                    </div>
                  )}
                </div>
              )}

              {/* Letter drafting step removed */}

              <div className="flex justify-between p-10 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={async () => {
                      // Save the case data and show completion message
                      const caseId = await handleSave();
                      
                      if (caseId) {
                        // Call the onSave callback for any cleanup
                        onSave({
                          id: caseId,
                          action: "openWorkspace",
                          data: {
                            ...formData,
                            id: caseId
                          }
                        });
                        
                        // Navigate to the case workspace page
                        navigate(`/case/${caseId}`);
                      }
                    }}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        Finish
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Criteria tracker removed */}
        </div>
      </div>
    </div>
  );
};

export default CaseBuilder;
