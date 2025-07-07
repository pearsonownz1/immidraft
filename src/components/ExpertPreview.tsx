import React from 'react';
import { Loader2, AlertCircle, FileText, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpertDetails } from '@/services/expertService';

interface ExpertPreviewProps {
  expertId: string;
}

export default function ExpertPreview({ expertId }: ExpertPreviewProps) {
  const { expert, loading, error } = useExpertDetails(expertId);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Loading expert details...</p>
          </div>
          <div className="space-y-3 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !expert) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error || `Failed to load expert details for "${expertId}"`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{expert.name}</h3>
          <div className="space-y-1 text-sm">
            {expert.title && <p className="text-muted-foreground">{expert.title}</p>}
            {expert.organization && <p className="text-muted-foreground">{expert.organization}</p>}
          </div>
        </div>

        {/* Letterhead Preview */}
        {expert.letterheadUrl && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium">Letterhead</h4>
            </div>
            <div className="border rounded-md overflow-hidden">
              <img 
                src={expert.letterheadUrl} 
                alt={`${expert.name} Letterhead`} 
                className="w-full h-auto max-h-32 object-contain bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Signature Preview */}
        {expert.signatureUrl && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium">Signature</h4>
            </div>
            <div className="border rounded-md overflow-hidden p-4 bg-gray-50">
              <img 
                src={expert.signatureUrl} 
                alt={`${expert.name} Signature`} 
                className="h-16 object-contain"
              />
            </div>
          </div>
        )}

        {/* Intro Text Preview */}
        {expert.introText && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium">Introduction Preview</h4>
            </div>
            <div className="border rounded-md p-3 bg-gray-50 text-xs text-muted-foreground max-h-32 overflow-y-auto">
              <p className="whitespace-pre-line">{expert.introText.substring(0, 200)}...</p>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-xs">
          <p className="font-medium">Expert Assets</p>
          <p className="mt-1">
            When you generate a letter with this expert, their letterhead, signature, and introduction 
            will be automatically included in the final document.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
