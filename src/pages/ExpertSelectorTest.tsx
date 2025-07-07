import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleExpertSelector from '@/components/SimpleExpertSelector';
import ExpertPreview from '@/components/ExpertPreview';
import { useExpertDetails } from '@/services/expertService';

export default function ExpertSelectorTest() {
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const { expert } = useExpertDetails(selectedExpertId);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold">Expert Selector Test</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          This page demonstrates the expert selection feature for LetterAI. 
          Select an expert to see their details, letterhead, and signature.
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

      {selectedExpertId && expert && (
        <Card>
          <CardHeader>
            <CardTitle>Expert Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="letterhead">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="letterhead">Letterhead</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
                <TabsTrigger value="intro">Introduction</TabsTrigger>
              </TabsList>
              <TabsContent value="letterhead" className="p-4">
                {expert.letterheadUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={expert.letterheadUrl} 
                      alt={`${expert.name} Letterhead`} 
                      className="max-w-full h-auto border rounded-md shadow-sm"
                    />
                    <p className="mt-4 text-sm text-muted-foreground">
                      This letterhead will be displayed at the top of the expert letter.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No letterhead available for this expert</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="signature" className="p-4">
                {expert.signatureUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-8 border rounded-md">
                      <img 
                        src={expert.signatureUrl} 
                        alt={`${expert.name} Signature`} 
                        className="h-24 object-contain"
                      />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      This signature will be displayed at the bottom of the expert letter.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No signature available for this expert</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="intro" className="p-4">
                {expert.introText ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 border rounded-md">
                      <p className="whitespace-pre-line text-sm">{expert.introText}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This introduction will be used as the opening paragraph of the expert letter.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No introduction text available for this expert</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
