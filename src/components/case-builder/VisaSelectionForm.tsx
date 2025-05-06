import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisaSelectionFormProps {
  visaType: string;
  onVisaTypeChange: (value: string) => void;
}

const VisaSelectionForm: React.FC<VisaSelectionFormProps> = ({
  visaType,
  onVisaTypeChange,
}) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visa Selection</CardTitle>
        <CardDescription>
          Select the visa category for this petition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visa-type">Visa Type</Label>
            <Select value={visaType} onValueChange={onVisaTypeChange}>
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

          {visaType && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {visaTypes.find((v) => v.value === visaType)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {visaType === "o1a" &&
                    "For individuals with extraordinary ability in sciences, education, business, or athletics."}
                  {visaType === "o1b" &&
                    "For individuals with extraordinary ability in arts or extraordinary achievement in motion picture/television industry."}
                  {visaType === "eb1a" &&
                    "For foreign nationals with extraordinary ability in sciences, arts, education, business, or athletics."}
                  {visaType === "eb1b" &&
                    "For outstanding professors and researchers with international recognition."}
                  {visaType === "eb1c" &&
                    "For multinational managers or executives transferring to the US."}
                  {visaType === "eb2niw" &&
                    "For individuals whose work is in the national interest of the United States."}
                  {visaType === "l1a" &&
                    "For executives or managers transferring to a US office of the same employer."}
                  {visaType === "l1b" &&
                    "For employees with specialized knowledge transferring to a US office."}
                  {visaType === "h1b" &&
                    "For workers in specialty occupations that require theoretical or technical expertise."}
                  {visaType === "tn" &&
                    "For Canadian and Mexican citizens working in specific professional occupations."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaSelectionForm;
