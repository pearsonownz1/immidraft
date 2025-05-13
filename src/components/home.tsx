import React, { useState, useEffect } from "react";
import { getAllCases } from "@/services/caseService";
import { Link, useNavigate } from "react-router-dom";
import { useAppLayout } from "./AppLayout";
import type { Database } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home as HomeIcon,
  FileText,
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
  Menu,
  PlusCircle,
} from "lucide-react";
import CaseWorkspace from "./CaseWorkspace";

interface HomePageProps {
  activeTab?: string;
}

const HomePage = ({ activeTab: initialActiveTab }: HomePageProps = {}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || "dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [cases, setCases] = useState<Database['public']['Tables']['cases']['Row'][]>([]);

  // Fetch cases from Supabase when component mounts
  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const fetchedCases = await getAllCases();
        setCases(fetchedCases);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Format cases for display
  const recentCases = cases.slice(0, 5).map(caseItem => {
    // Format the updated_at date to a relative time string
    const updatedDate = new Date(caseItem.updated_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let updated = '';
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        updated = `${diffMinutes} minutes ago`;
      } else {
        updated = `${diffHours} hours ago`;
      }
    } else if (diffDays === 1) {
      updated = '1 day ago';
    } else {
      updated = `${diffDays} days ago`;
    }
    
    return {
      id: caseItem.id,
      name: `${caseItem.client_first_name} ${caseItem.client_last_name}`,
      type: caseItem.visa_type.toUpperCase(),
      status: caseItem.status,
      updated,
    };
  });

  // Use only real data from the database, no mock data
  const displayCases = recentCases;

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

  const navigate = useNavigate();
  
  const handleOpenCase = (caseId: string) => {
    // Navigate to the case workspace page
    navigate(`/case/${caseId}`);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden"
            onClick={() => {
              // Use the context to toggle the mobile menu
              const { toggleMobileMenu } = useAppLayout();
              toggleMobileMenu();
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center rounded-md bg-muted px-3 py-1 w-full md:w-64">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search cases..."
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Project
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/letter-ai')}>
                Expert Letter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/translate-ai')}>
                Certified Translation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/evaluateai')}>
                Credential Evaluation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <main className="p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              {/* "New Case" button removed */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cases.filter(c => c.status === 'In Progress').length}</div>
                  <p className="text-xs text-muted-foreground">
                    From database
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
                  <div className="text-2xl font-bold">{cases.filter(c => c.status === 'Review').length}</div>
                  <p className="text-xs text-muted-foreground">
                    From database
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
                  <div className="text-2xl font-bold">{cases.filter(c => c.status === 'Complete').length}</div>
                  <p className="text-xs text-muted-foreground">
                    From database
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent AI Projects */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent AI Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr className="m-0 p-0 even:bg-muted">
                        <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample data - would be replaced with actual data from API */}
                      <tr className="m-0 p-0 border-b">
                        <td className="p-4 align-middle">John Smith EB-1A</td>
                        <td className="p-4 align-middle">May 5, 2025</td>
                        <td className="p-4 align-middle">
                          <Badge>Expert Letter</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="outline" size="sm" onClick={() => navigate('/letter-ai')}>
                            View
                          </Button>
                        </td>
                      </tr>
                      <tr className="m-0 p-0 border-b">
                        <td className="p-4 align-middle">Maria Garcia Resume</td>
                        <td className="p-4 align-middle">May 3, 2025</td>
                        <td className="p-4 align-middle">
                          <Badge>Translation</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="outline" size="sm" onClick={() => navigate('/translate-ai')}>
                            View
                          </Button>
                        </td>
                      </tr>
                      <tr className="m-0 p-0 border-b">
                        <td className="p-4 align-middle">Wei Zhang Diploma</td>
                        <td className="p-4 align-middle">May 1, 2025</td>
                        <td className="p-4 align-middle">
                          <Badge>Evaluation</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="outline" size="sm" onClick={() => navigate('/evaluateai')}>
                            View
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Cases section removed */}
          </div>
        )}

        {/* Case builder section removed */}

        {/* Cases tab content removed */}

        {/* Clients and Settings tab content removed */}
      </main>

      {/* Visa Type Selection Modal removed */}
    </div>
  );
};

export default HomePage;
