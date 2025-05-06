import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VisaType {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

interface VisaTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVisaType: (visaTypeId: string) => void;
  visaTypes: VisaType[];
}

const VisaTypeSelectionModal: React.FC<VisaTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectVisaType,
  visaTypes,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            New Application
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <h3 className="text-sm font-medium mb-2">Select Visa Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {visaTypes.map((visaType) => (
              <div
                key={visaType.id}
                className="border rounded-md p-2 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onSelectVisaType(visaType.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    {visaType.icon}
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {visaType.name}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {visaType.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VisaTypeSelectionModal;
