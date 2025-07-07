import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleExpertSelector from '@/components/SimpleExpertSelector';
import ExpertPreview from '@/components/ExpertPreview';
import { useExpertDetails } from '@/services/expertService';
import { aiService } from '@/services/aiService';

export default function ExpertLetterTest() {
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [letterContent, setLetterContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { expert } = useExpertDetails(selectedExpertId);

  const generateSampleLetter = async () => {
    if (!expert) return;
    
    setIsGenerating(true);
    try {
      // Sample applicant data
      const applicant = { name: "John Smith" };
      
      // Sample documents
      const sampleDocs = [
        {
          id: "1",
          title: "Resume",
          description: "Professional resume",
          type: "resume",
          tags: ["resume", "professional"]
        }
      ];
      
      // Generate letter using AI service
      const result = await aiService.draftExpertLetter(
        "O-1A",
        applicant, 
        { 
          name: expert.name,
          title: expert.title,
          organization: expert.organization,
          relationship: "Mentor",
          introText: expert.introText
        }, 
        sampleDocs
      );
      
      // If we have an expert with intro text, replace the intro paragraph
      if (expert.introText) {
        console.log("Using expert intro text:", expert.introText);
        // Find the intro paragraph (usually starts with "Dear USCIS" or similar)
        const introRegex = /(Dear USCIS|To Whom It May Concern|Dear Sir or Madam|Dear Immigration Officer).*?\n\n/s;
        const introMatch = result.content.match(introRegex);
        
        if (introMatch && introMatch.index !== undefined) {
          // Replace the intro paragraph with the expert's intro text
          const beforeIntro = result.content.substring(0, introMatch.index);
          const afterIntro = result.content.substring(introMatch.index + introMatch[0].length);
          result.content = beforeIntro + expert.introText + "\n\n" + afterIntro;
        }
      }
      
      setLetterContent(result.content);
    } catch (error) {
      console.error("Error generating letter:", error);
      setLetterContent("Error generating letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold">Expert Letter Test</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          This page tests the expert selection and auto-population features for LetterAI. 
          Select an expert to see their details and generate a sample letter with their information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Select an Expert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expert</label>
              <SimpleExpertSelector
                value={selectedExpertId}
                onChange={setSelectedExpertId}
                className="w-full"
              />
            </div>

            {selectedExpertId && (
              <div className="p-4 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-800">Selected Expert ID: {selectedExpertId}</p>
                {expert && (
                  <div className="mt-2 text-blue-700">
                    <p>Name: {expert.name}</p>
                    {expert.title && <p>Title: {expert.title}</p>}
                    {expert.organization && <p>Organization: {expert.organization}</p>}
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={generateSampleLetter} 
              disabled={!selectedExpertId || isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Sample Letter"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expert Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedExpertId ? (
              <ExpertPreview expertId={selectedExpertId} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Select an expert to see their preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Letter</CardTitle>
        </CardHeader>
        <CardContent>
          {letterContent ? (
            <div className="bg-white p-6 border rounded-md whitespace-pre-line">
              {letterContent}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select an expert and click "Generate Sample Letter" to see a letter with auto-populated expert information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
