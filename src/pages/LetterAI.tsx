import React, { useState } from "react";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LetterAIWizard from "@/components/LetterAIWizard";
import { letterService, Letter } from "@/services/letterService";

const LetterAI: React.FC = () => {
  const [savedLetter, setSavedLetter] = useState<Letter | null>(null);

  // Handle saving the letter
  const handleSaveLetter = async (letterContent: string, letterTitle: string) => {
    try {
      // Create a new letter object
      const letter: Letter = {
        title: letterTitle,
        content: letterContent,
        letter_type: 'expert',
        visa_type: 'O-1A', // This will be set by the wizard
        tags: []
      };
      
      // Save the letter
      const result = await letterService.createLetter(letter);
      
      if (result) {
        setSavedLetter(result);
        alert(`Letter "${letterTitle}" saved successfully!`);
      } else {
        throw new Error("Failed to save letter");
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      alert("Failed to save letter. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b px-8 py-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">LetterAI</h1>
          <Badge variant="outline" className="ml-2">Expert Opinion Letter Generator</Badge>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <LetterAIWizard onSaveLetter={handleSaveLetter} />
      </main>
    </div>
  );
};

export default LetterAI;
