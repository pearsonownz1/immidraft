import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisaTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const VisaTypeSelector: React.FC<VisaTypeSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const visaTypes = [
    { value: "O-1A", label: "O-1A (Extraordinary Ability)" },
    { value: "EB-1A", label: "EB-1A (Extraordinary Ability)" },
    { value: "EB-2 NIW", label: "EB-2 NIW (National Interest Waiver)" },
    { value: "H-1B", label: "H-1B (Specialty Occupation)" },
    { value: "L-1A", label: "L-1A (Intracompany Transferee)" },
    { value: "L-1B", label: "L-1B (Specialized Knowledge)" },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select visa type" />
      </SelectTrigger>
      <SelectContent>
        {visaTypes.map((visaType) => (
          <SelectItem key={visaType.value} value={visaType.value}>
            {visaType.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default VisaTypeSelector;
