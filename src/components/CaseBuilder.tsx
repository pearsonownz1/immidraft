import React, { useState } from "react";
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
} from "lucide-react";
import DocumentUploader from "./DocumentUploader";
import LetterEditor from "./LetterEditor";
import CriteriaTracker from "./CriteriaTracker";

interface CaseBuilderProps {
  initialStep?: number;
  onSave?: (data: any) => void;
}

const CaseBuilder = ({
  initialStep = 0,
  onSave = () => {},
}: CaseBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [progress, setProgress] = useState(0);
  const [navCollapsed, setNavCollapsed] = useState(false);
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

  const [caseDocuments, setCaseDocuments] = useState([
    {
      id: "1",
      name: "Resume.pdf",
      size: "245 KB",
      type: "application/pdf",
      tags: ["Resume", "Professional"],
      criteria: ["Education", "Work Experience"],
      uploadDate: "2023-06-15",
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
    },
  ]);

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
    },
    {
      id: "letter-drafting",
      title: "Letter Drafting",
      icon: <PenTool className="h-4 w-4" />,
    },
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
        ...formData[section as keyof typeof formData],
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

  const handleSave = () => {
    onSave(formData);
  };

  const toggleNav = () => {
    setNavCollapsed(!navCollapsed);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Case Builder</h1>
            <p className="text-muted-foreground">
              Build your visa petition case step by step
            </p>
          </div>
          <Button variant="outline" onClick={handleSave} className="bg-white">
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Left sidebar with vertical progress and steps */}
          <div
            className={`${navCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col`}
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
                      {/* Vertical progress line */}
                      {index < steps.length - 1 && (
                        <div className="absolute left-[19px] top-[32px] w-[2px] h-[calc(100%-16px)] bg-gray-200">
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
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {currentStep === 0 && (
                <div className="p-6">
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
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="p-6">
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
                        <SelectTrigger id="visa-type">
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
                        <p className="text-sm">
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
                <div className="p-6">
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <textarea
                        id="jobDescription"
                        className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                <div className="p-6">
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
                </div>
              )}

              {currentStep === 4 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-1">
                    Letter Drafting
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Draft and edit petition letters with AI assistance
                  </p>
                  <Tabs defaultValue="petition">
                    <TabsList className="mb-4">
                      <TabsTrigger value="petition">
                        <FileText className="h-4 w-4 mr-2" />
                        Petition Letter
                      </TabsTrigger>
                      <TabsTrigger value="expert">
                        <FileText className="h-4 w-4 mr-2" />
                        Expert Opinion Letter
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="petition">
                      <LetterEditor
                        letterType="petition"
                        documents={caseDocuments}
                        beneficiaryInfo={{
                          name: formData.petitionDetails.beneficiaryName,
                        }}
                        petitionerInfo={{
                          name: formData.petitionDetails.petitionerName,
                        }}
                        showComments={false}
                      />
                    </TabsContent>
                    <TabsContent value="expert">
                      <LetterEditor
                        letterType="expert"
                        documents={caseDocuments}
                        beneficiaryInfo={{
                          name: formData.petitionDetails.beneficiaryName,
                        }}
                        showComments={false}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="bg-primary"
                >
                  {currentStep === steps.length - 2 ? (
                    <>
                      Finish
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right sidebar with criteria tracker */}
          <div className="w-80">
            <CriteriaTracker
              visaType={formData.visaType}
              onCriterionClick={(id) => console.log("Criterion clicked:", id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseBuilder;
