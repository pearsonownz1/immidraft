import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home as HomeIcon,
  FileText,
  Users,
  Settings,
  PlusCircle,
  Search,
  Bell,
  ChevronDown,
  Folder,
  Clock,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Building,
  Lightbulb,
  Plane,
  Globe,
} from "lucide-react";
import CaseBuilder from "./CaseBuilder";
import VisaTypeSelectionModal from "./VisaTypeSelectionModal";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isVisaTypeModalOpen, setIsVisaTypeModalOpen] = useState(false);

  // Mock data for recent cases
  const recentCases = [
    {
      id: "1",
      name: "John Smith",
      type: "O-1A",
      status: "In Progress",
      updated: "2 hours ago",
    },
    {
      id: "2",
      name: "Maria Rodriguez",
      type: "EB-1A",
      status: "Draft",
      updated: "1 day ago",
    },
    {
      id: "3",
      name: "Wei Chen",
      type: "H-1B",
      status: "Review",
      updated: "3 days ago",
    },
    {
      id: "4",
      name: "Priya Patel",
      type: "L-1A",
      status: "Complete",
      updated: "1 week ago",
    },
  ];

  // Mock data for visa categories
  const visaCategories = [
    {
      id: "o1a",
      name: "O-1A",
      description:
        "For individuals with extraordinary ability in business, science, or education",
      icon: <Award />,
    },
    {
      id: "o1b",
      name: "O-1B",
      description:
        "For artists and entertainers with extraordinary achievement",
      icon: <FileText />,
    },
    {
      id: "eb1a",
      name: "EB-1A",
      description:
        "For individuals with extraordinary ability seeking permanent residence",
      icon: <Award />,
    },
    {
      id: "eb1b",
      name: "EB-1B",
      description: "For internationally recognized professors and researchers",
      icon: <GraduationCap />,
    },
    {
      id: "eb1c",
      name: "EB-1C",
      description: "For multinational company executives or managers",
      icon: <Building />,
    },
    {
      id: "eb2niw",
      name: "EB-2 NIW",
      description: "For professionals whose work serves the national interest",
      icon: <Lightbulb />,
    },
    {
      id: "l1a",
      name: "L-1A",
      description: "For managers and executives in multinational companies",
      icon: <Briefcase />,
    },
    {
      id: "l1b",
      name: "L-1B",
      description:
        "For employees with specialized knowledge in multinational companies",
      icon: <Briefcase />,
    },
    {
      id: "h1b",
      name: "H-1B",
      description: "For knowledge workers in specialty occupations",
      icon: <Plane />,
    },
    {
      id: "tn",
      name: "TN",
      description: "For temporary workers in North America",
      icon: <Globe />,
    },
  ];

  const handleOpenCase = (caseId: string) => {
    setActiveTab("case-builder");
    setActiveCaseId(caseId);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="bg-primary rounded-md p-1 mr-2">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">GEO Credentials</h1>
        </div>

        <nav className="space-y-1">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "cases" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("cases")}
          >
            <Folder className="mr-2 h-4 w-4" />
            Cases
          </Button>
          <Button
            variant={activeTab === "clients" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("clients")}
          >
            <Users className="mr-2 h-4 w-4" />
            Clients
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-4">
          <div className="flex items-center p-2 rounded-md bg-muted">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">
                admin@geocredentials.com
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <div className="flex items-center rounded-md bg-muted px-3 py-1 w-64">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search cases..."
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <Button onClick={() => setIsVisaTypeModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Case
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">
                      -1 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-xs text-muted-foreground">
                      +5 from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {recentCases.map((caseItem) => (
                          <div
                            key={caseItem.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => handleOpenCase(caseItem.id)}
                          >
                            <div>
                              <p className="font-medium">{caseItem.name}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {caseItem.type}
                                </Badge>
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{caseItem.updated}</span>
                              </div>
                            </div>
                            <Badge
                              variant={
                                caseItem.status === "Complete"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {caseItem.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "case-builder" && activeCaseId && (
            <CaseBuilder
              visaTypeId={activeCaseId}
              onClose={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "cases" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">All Cases</h2>
              <p className="text-muted-foreground">
                Case management interface would be implemented here.
              </p>
            </div>
          )}

          {activeTab === "clients" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Clients</h2>
              <p className="text-muted-foreground">
                Client management interface would be implemented here.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Settings</h2>
              <p className="text-muted-foreground">
                Settings interface would be implemented here.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Visa Type Selection Modal */}
      <VisaTypeSelectionModal
        isOpen={isVisaTypeModalOpen}
        onClose={() => setIsVisaTypeModalOpen(false)}
        onSelectVisaType={(visaTypeId) => {
          setIsVisaTypeModalOpen(false);
          setActiveTab("case-builder");
          setActiveCaseId(visaTypeId);
        }}
        visaTypes={visaCategories}
      />
    </div>
  );
};

export default HomePage;
