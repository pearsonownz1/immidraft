import React, { useState, useEffect } from "react";
import { getAllCases } from "@/services/caseService";
import { useNavigate } from "react-router-dom";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  FileEdit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Case = Database['public']['Tables']['cases']['Row'];

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Case>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const navigate = useNavigate();

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

  const handleSort = (field: keyof Case) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCases = [...cases].sort((a, b) => {
    if (a[sortField] === null) return 1;
    if (b[sortField] === null) return -1;
    
    if (a[sortField] < b[sortField]) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredCases = sortedCases.filter(caseItem => {
    const searchLower = searchTerm.toLowerCase();
    return (
      caseItem.client_first_name.toLowerCase().includes(searchLower) ||
      caseItem.client_last_name.toLowerCase().includes(searchLower) ||
      caseItem.beneficiary_name.toLowerCase().includes(searchLower) ||
      caseItem.visa_type.toLowerCase().includes(searchLower) ||
      caseItem.status.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleEditCase = (caseId: string) => {
    // Navigate to edit case page or open edit modal
    console.log(`Edit case: ${caseId}`);
  };

  const handleDeleteCase = (caseId: string) => {
    // Show confirmation dialog and delete case
    console.log(`Delete case: ${caseId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">All Cases</h2>
        <Button onClick={() => navigate('/dashboard/new-application')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center w-full max-w-sm space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("beneficiary_name")}
                    >
                      <div className="flex items-center">
                        Beneficiary
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("client_last_name")}
                    >
                      <div className="flex items-center">
                        Client
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("visa_type")}
                    >
                      <div className="flex items-center">
                        Visa Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("updated_at")}
                    >
                      <div className="flex items-center">
                        Last Updated
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No cases found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCases.map((caseItem) => (
                      <TableRow key={caseItem.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell 
                          className="font-medium"
                          onClick={() => handleViewCase(caseItem.id)}
                        >
                          {caseItem.beneficiary_name}
                        </TableCell>
                        <TableCell onClick={() => handleViewCase(caseItem.id)}>
                          {caseItem.client_first_name} {caseItem.client_last_name}
                        </TableCell>
                        <TableCell onClick={() => handleViewCase(caseItem.id)}>
                          <Badge variant="outline">
                            {caseItem.visa_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleViewCase(caseItem.id)}>
                          <Badge
                            variant={
                              caseItem.status === "Complete"
                                ? "default"
                                : caseItem.status === "In Progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {caseItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleViewCase(caseItem.id)}>
                          {formatDate(caseItem.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCase(caseItem.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCase(caseItem.id)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCase(caseItem.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CasesPage;
