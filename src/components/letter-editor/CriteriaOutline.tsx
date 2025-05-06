import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

interface Criterion {
  id: string;
  title: string;
  description: string;
  status: "complete" | "partial" | "incomplete";
}

interface CriteriaOutlineProps {
  criteria: Criterion[];
  onGenerateForCriterion?: (criterionId: string) => void;
}

const CriteriaOutline = ({
  criteria = [],
  onGenerateForCriterion = () => {},
}: CriteriaOutlineProps) => {
  return (
    <div className="w-64 border-l bg-muted/10 overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium">Outline & Criteria</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{criterion.title}</h4>
                <Badge
                  variant={
                    criterion.status === "complete"
                      ? "default"
                      : criterion.status === "partial"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {criterion.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {criterion.description}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full justify-start"
                onClick={() => onGenerateForCriterion(criterion.id)}
              >
                <BrainCircuit className="h-3 w-3 mr-1" />
                Generate for this criterion
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CriteriaOutline;
