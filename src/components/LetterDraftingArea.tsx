import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Save,
  Download,
  PenTool,
  Sparkles,
  History,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import CriteriaTracker from "./CriteriaTracker";
import LetterEditor from "./LetterEditor";

interface LetterDraftingAreaProps {
  clientName?: string;
  visaType?: string;
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
    field?: string;
  };
  petitionerInfo?: {
    name: string;
  };
  onBackToCaseBuilder?: () => void;
}

const LetterDraftingArea: React.FC<LetterDraftingAreaProps> = ({
  clientName = "Max Bauer",
  visaType = "O-1A Extraordinary Ability Visa",
  documents = [],
  beneficiaryInfo = { name: "Max Bauer", field: "Robotics Engineering and Artificial Intelligence" },
  petitionerInfo = { name: "TechInnovate Inc." },
  onBackToCaseBuilder = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackToCaseBuilder}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
            <h1 className="text-xl font-semibold">{clientName}</h1>
            <Badge variant="outline" className="ml-2">
              {visaType}
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Latest Versions
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="mt-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="letters">Letters</TabsTrigger>
            <TabsTrigger value="exhibits">Exhibits</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <TabsContent value="overview" className="mt-0">
          <div className="flex gap-8 px-8">
            {/* Left column - Criteria tracker */}
            <div className="w-[320px] flex-shrink-0">
              <CriteriaTracker 
                visaType={visaType}
                onCriterionClick={(id) => console.log("Criterion clicked:", id)}
              />
            </div>
            
            {/* Middle column - Client info and petition details */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Attorney Petition</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Manage exhibits and review supporting evidence for relevant criteria to inform the draft petition.
                </p>
                
                <div className="flex space-x-4 mb-6">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Request Research
                  </Button>
                  <Button variant="outline" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Prompt
                  </Button>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Latest Versions
                  </Button>
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-md font-medium mb-4">Background of the Beneficiary</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{beneficiaryInfo.name.split(' ')[0]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{beneficiaryInfo.name.split(' ')[1]}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Field of Endeavor</p>
                    <p className="font-medium">{beneficiaryInfo.field}</p>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" size="sm">
                      <PenTool className="h-4 w-4 mr-2" />
                      Edit Changes
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-md font-medium mb-4">Related Documents</h3>
                
                <div className="space-y-3">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.size} • {doc.uploadDate}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Quick actions */}
            <div className="w-[240px] flex-shrink-0">
              <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Draft Petition Letter
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-medium mb-3">Case Status</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Stage</p>
                    <p className="font-medium text-sm">Drafting</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-medium text-sm">Today, 2:45 PM</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="font-medium text-sm">Jane Smith</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="letters" className="mt-0">
          <div className="flex gap-8 px-8">
            <div className="w-[320px] flex-shrink-0">
              <CriteriaTracker 
                visaType={visaType}
                onCriterionClick={(id) => console.log("Criterion clicked:", id)}
              />
            </div>
            
            <div className="flex-1">
              <LetterEditor
                letterType="petition"
                documents={documents}
                beneficiaryInfo={{
                  name: beneficiaryInfo.name,
                }}
                petitionerInfo={{
                  name: petitionerInfo.name,
                }}
                showComments={true}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exhibits" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm p-6 mx-8">
            <h2 className="text-lg font-semibold mb-4">Document Exhibits</h2>
            <p className="text-gray-500 mb-6">
              Organize and manage supporting documents for your case.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{doc.size} • {doc.uploadDate}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags && doc.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button variant="ghost" size="sm">Preview</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No documents uploaded yet.</p>
                  <Button variant="outline" className="mt-4">Upload Documents</Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </main>
    </div>
  );
};

export default LetterDraftingArea;
