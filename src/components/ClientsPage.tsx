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
  Mail,
  Phone,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Case = Database['public']['Tables']['cases']['Row'];

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  caseCount: number;
  latestCaseId: string;
  latestCaseDate: string;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Client>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        // Fetch all cases
        const fetchedCases = await getAllCases();
        
        // Extract unique clients from cases
        const clientMap = new Map<string, Client>();
        
        fetchedCases.forEach(caseItem => {
          const clientKey = `${caseItem.client_first_name.toLowerCase()}_${caseItem.client_last_name.toLowerCase()}_${caseItem.client_email.toLowerCase()}`;
          
          if (clientMap.has(clientKey)) {
            // Update existing client
            const existingClient = clientMap.get(clientKey)!;
            existingClient.caseCount += 1;
            
            // Update latest case if this one is newer
            const caseDate = new Date(caseItem.updated_at);
            const existingDate = new Date(existingClient.latestCaseDate);
            
            if (caseDate > existingDate) {
              existingClient.latestCaseId = caseItem.id;
              existingClient.latestCaseDate = caseItem.updated_at;
            }
            
            clientMap.set(clientKey, existingClient);
          } else {
            // Add new client
            clientMap.set(clientKey, {
              id: clientKey,
              firstName: caseItem.client_first_name,
              lastName: caseItem.client_last_name,
              email: caseItem.client_email,
              phone: caseItem.client_phone,
              company: caseItem.client_company,
              caseCount: 1,
              latestCaseId: caseItem.id,
              latestCaseDate: caseItem.updated_at
            });
          }
        });
        
        // Convert map to array
        setClients(Array.from(clientMap.values()));
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
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

  const filteredClients = sortedClients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchLower)
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

  const handleViewClient = (clientId: string) => {
    // In a real app, you might navigate to a client detail page
    console.log(`View client: ${clientId}`);
  };

  const handleViewLatestCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleCreateCase = (client: Client) => {
    // Navigate to case builder with pre-filled client info
    console.log(`Create case for client: ${client.firstName} ${client.lastName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Clients</h2>
        <Button onClick={() => navigate('/dashboard/new-application')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Client
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
                  placeholder="Search clients..."
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
                      onClick={() => handleSort("lastName")}
                    >
                      <div className="flex items-center">
                        Client Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("company")}
                    >
                      <div className="flex items-center">
                        Company
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Contact
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("caseCount")}
                    >
                      <div className="flex items-center">
                        Cases
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("latestCaseDate")}
                    >
                      <div className="flex items-center">
                        Latest Activity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No clients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell 
                          className="font-medium"
                          onClick={() => handleViewClient(client.id)}
                        >
                          {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell onClick={() => handleViewClient(client.id)}>
                          {client.company || "-"}
                        </TableCell>
                        <TableCell onClick={() => handleViewClient(client.id)}>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-sm">{client.email || "-"}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-sm">{client.phone || "-"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewClient(client.id)}>
                          <Badge variant="outline">
                            {client.caseCount}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleViewClient(client.id)}>
                          {formatDate(client.latestCaseDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Client
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewLatestCase(client.latestCaseId)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                View Latest Case
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateCase(client)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Case
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

export default ClientsPage;
