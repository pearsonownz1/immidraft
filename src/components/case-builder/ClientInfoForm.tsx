import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ClientInfoFormProps {
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  onInputChange: (section: string, field: string, value: string) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientInfo,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>Enter the client's basic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={clientInfo.firstName}
              onChange={(e) =>
                onInputChange("clientInfo", "firstName", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={clientInfo.lastName}
              onChange={(e) =>
                onInputChange("clientInfo", "lastName", e.target.value)
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={clientInfo.email}
            onChange={(e) =>
              onInputChange("clientInfo", "email", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={clientInfo.phone}
            onChange={(e) =>
              onInputChange("clientInfo", "phone", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            value={clientInfo.company}
            onChange={(e) =>
              onInputChange("clientInfo", "company", e.target.value)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInfoForm;
