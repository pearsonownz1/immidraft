import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CriterionItem {
  id: string;
  title: string;
  description: string;
  status: "incomplete" | "partial" | "complete";
  documentCount: number;
  requiredCount: number;
}

interface CriteriaCategory {
  id: string;
  title: string;
  criteria: CriterionItem[];
  progress: number;
}

interface CriteriaTrackerProps {
  visaType?: string;
  categories?: CriteriaCategory[];
  onCriterionClick?: (criterionId: string) => void;
}

const CriteriaTracker: React.FC<CriteriaTrackerProps> = ({
  visaType = "O-1A Visa",
  categories = defaultCategories,
  onCriterionClick = () => {},
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "cat1",
  );

  const totalProgress =
    categories.reduce((sum, category) => {
      return sum + category.progress;
    }, 0) / categories.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "partial":
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      case "incomplete":
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-50 text-green-800 hover:bg-green-100";
      case "partial":
        return "bg-amber-50 text-amber-800 hover:bg-amber-100";
      case "incomplete":
      default:
        return "bg-red-50 text-red-800 hover:bg-red-100";
    }
  };

  return (
    <div className="w-full h-full bg-white shadow-sm border border-gray-200 rounded-lg">
      <div className="p-4 pb-2">
        <h2 className="text-lg font-semibold">Criteria Tracker</h2>
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>
      </div>
      <div className="pt-0 px-3 overflow-auto max-h-[calc(100vh-200px)]">
        <Accordion
          type="single"
          collapsible
          value={expandedCategory || undefined}
          onValueChange={(value) => setExpandedCategory(value)}
          className="w-full"
        >
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border-b border-gray-200"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex justify-between items-center w-full pr-2">
                  <span className="font-medium text-sm">{category.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {Math.round(category.progress)}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 py-1">
                  {category.criteria.map((criterion) => (
                    <TooltipProvider key={criterion.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left p-2 h-auto ${getStatusColor(criterion.status)}`}
                            onClick={() => onCriterionClick(criterion.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-shrink-0">
                                {getStatusIcon(criterion.status)}
                              </div>
                              <div className="flex-grow">
                                <p className="text-xs font-medium line-clamp-2">
                                  {criterion.title}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs">
                                    {criterion.documentCount}/
                                    {criterion.requiredCount} documents
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-medium">{criterion.title}</p>
                          <p className="text-xs mt-1">
                            {criterion.description}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-4 pt-2 border-t border-gray-200 pb-4">
          <Button variant="outline" size="sm" className="w-full text-sm">
            View Missing Requirements
          </Button>
        </div>
      </div>
    </div>
  );
};

// Default mock data
const defaultCategories: CriteriaCategory[] = [
  {
    id: "cat1",
    title: "Extraordinary Ability Evidence",
    progress: 65,
    criteria: [
      {
        id: "c1",
        title: "National or International Award",
        description:
          "Evidence of receipt of nationally or internationally recognized prizes or awards for excellence in the field of endeavor.",
        status: "complete",
        documentCount: 3,
        requiredCount: 3,
      },
      {
        id: "c2",
        title: "Membership in Prestigious Associations",
        description:
          "Evidence of membership in associations in the field that require outstanding achievements of their members, as judged by recognized experts.",
        status: "partial",
        documentCount: 1,
        requiredCount: 2,
      },
      {
        id: "c3",
        title: "Published Material About the Beneficiary",
        description:
          "Published material about the beneficiary in professional or major trade publications or other major media.",
        status: "incomplete",
        documentCount: 0,
        requiredCount: 3,
      },
    ],
  },
  {
    id: "cat2",
    title: "Professional Background",
    progress: 40,
    criteria: [
      {
        id: "c4",
        title: "Original Contributions of Major Significance",
        description:
          "Evidence of the beneficiary's original scientific, scholarly, artistic, athletic, or business-related contributions of major significance in the field.",
        status: "partial",
        documentCount: 2,
        requiredCount: 4,
      },
      {
        id: "c5",
        title: "Scholarly Articles",
        description:
          "Evidence of the beneficiary's authorship of scholarly articles in the field, in professional or major trade publications or other major media.",
        status: "incomplete",
        documentCount: 0,
        requiredCount: 2,
      },
    ],
  },
  {
    id: "cat3",
    title: "Salary and Commercial Success",
    progress: 25,
    criteria: [
      {
        id: "c6",
        title: "High Salary or Remuneration",
        description:
          "Evidence that the beneficiary has commanded a high salary or other significantly high remuneration for services, in relation to others in the field.",
        status: "partial",
        documentCount: 1,
        requiredCount: 2,
      },
      {
        id: "c7",
        title: "Commercial Success in Performing Arts",
        description:
          "Evidence of commercial successes in the performing arts, as shown by box office receipts or record, cassette, compact disk, or video sales.",
        status: "incomplete",
        documentCount: 0,
        requiredCount: 3,
      },
    ],
  },
];

export default CriteriaTracker;
