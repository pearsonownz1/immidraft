import { useState } from "react";

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

interface PetitionDetails {
  beneficiaryName: string;
  petitionerName: string;
  jobTitle: string;
  jobDescription: string;
}

interface CaseBuilderFormData {
  clientInfo: ClientInfo;
  visaType: string;
  petitionDetails: PetitionDetails;
  documents: any[];
}

interface UseCaseBuilderFormReturn {
  formData: CaseBuilderFormData;
  currentStep: number;
  progress: number;
  setCurrentStep: (step: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleInputChange: (section: string, field: string, value: string) => void;
  handleVisaTypeChange: (value: string) => void;
  handleSave: () => void;
}

export const useCaseBuilderForm = (
  initialStep = 0,
  onSave = (data: any) => {},
): UseCaseBuilderFormReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState<CaseBuilderFormData>({
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

  const steps = [
    { id: "client-info", title: "Client Information" },
    { id: "visa-selection", title: "Visa Selection" },
    { id: "petition-details", title: "Petition Details" },
    { id: "document-upload", title: "Document Upload" },
    { id: "letter-drafting", title: "Letter Drafting" },
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

  return {
    formData,
    currentStep,
    progress,
    setCurrentStep,
    handleNext,
    handlePrevious,
    handleInputChange,
    handleVisaTypeChange,
    handleSave,
  };
};

export default useCaseBuilderForm;
