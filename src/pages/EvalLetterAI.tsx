import React, { useState, useRef } from 'react';
import { EvaluationLetterData, UploadedDocument, evaluationLetterService } from '@/services/evaluationLetterService';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Removed FileUploader import as it doesn't exist
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download, CheckCircle, AlertCircle, Upload, FileUp, RefreshCw, Sparkles, Save } from 'lucide-react';

const EvalLetterAI: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to generate default letter content based on evaluation data
  const getDefaultLetterContent = () => {
    if (!evaluationLetter.client_name) return '';
    
    return `[LETTERHEAD]

EDUCATIONAL EVALUATION REPORT

Date: ${new Date().toLocaleDateString()}

RE: Evaluation of Academic Credentials for ${evaluationLetter.client_name}

To Whom It May Concern:

This evaluation report represents an analysis of the academic credentials earned by ${evaluationLetter.client_name} at ${evaluationLetter.university || '[UNIVERSITY]'} in ${evaluationLetter.country || '[COUNTRY]'}. The purpose of this evaluation is to determine the U.S. educational equivalency of these credentials.

SUMMARY OF FINDINGS:

Based on a thorough review of the academic documents provided, it is my professional opinion that ${evaluationLetter.client_name}'s ${evaluationLetter.bachelor_degree || '[DEGREE]'} degree earned from ${evaluationLetter.university || '[UNIVERSITY]'} in ${evaluationLetter.degree_date1 || '[YEAR]'} is equivalent to a ${evaluationLetter.us_equivalent_degree1 || 'Bachelor of Science'} from a regionally accredited institution in the United States.

${evaluationLetter.additional_degree ? 
`Additionally, ${evaluationLetter.client_name}'s ${typeof evaluationLetter.additional_degree === 'string' ? evaluationLetter.additional_degree : '[ADDITIONAL DEGREE]'} degree earned from ${evaluationLetter.university2 || '[UNIVERSITY2]'} in ${evaluationLetter.degree_date2 || '[YEAR]'} is equivalent to a ${evaluationLetter.us_equivalent_degree2 || '[US EQUIVALENT]'} from a regionally accredited institution in the United States.` : ''}

ACADEMIC HISTORY:

Institution: ${evaluationLetter.university || '[UNIVERSITY]'}
Location: ${evaluationLetter.university_location || '[LOCATION]'}
Degree: ${evaluationLetter.bachelor_degree || '[DEGREE]'}
Field of Study: ${evaluationLetter.field_of_study || '[FIELD]'}
Date of Award: ${evaluationLetter.degree_date1 || '[DATE]'}
Program Length: ${evaluationLetter.program_length1 || '4 years'}

${evaluationLetter.additional_degree ? 
`Institution: ${evaluationLetter.university2 || '[UNIVERSITY2]'}
Location: ${evaluationLetter.university2_location || '[LOCATION]'}
Degree: ${typeof evaluationLetter.additional_degree === 'string' ? evaluationLetter.additional_degree : '[ADDITIONAL DEGREE]'}
Field of Study: ${evaluationLetter.field_of_study2 || '[FIELD]'}
Date of Award: ${evaluationLetter.degree_date2 || '[DATE]'}
Program Length: ${evaluationLetter.program_length2 || '2 years'}` : ''}

PROFESSIONAL EXPERIENCE:

${evaluationLetter.client_name} has ${evaluationLetter.years || '[YEARS]'} years of professional experience in the field of ${evaluationLetter.specialty || '[SPECIALTY]'}. Their work experience includes:

${evaluationLetter.work_experience_summary.length > 0 ? 
  evaluationLetter.work_experience_summary.map(item => `• ${item}`).join('\n') : 
  '• [WORK EXPERIENCE DETAILS]'}

BASIS OF EVALUATION:

This evaluation is based on official academic records provided by the applicant, including diplomas, transcripts, and supporting documentation. The evaluation follows standards and guidelines established by the National Association of Credential Evaluation Services (NACES) and the American Association of Collegiate Registrars and Admissions Officers (AACRAO).

RECOMMENDATION:

Based on the evaluation of the academic credentials presented, I recommend that ${evaluationLetter.client_name}'s educational qualifications be recognized as equivalent to a ${evaluationLetter.us_equivalent_degree1 || 'Bachelor of Science'} from a regionally accredited institution in the United States.

Sincerely,

Guy Pearson
Senior Evaluator
ImmiDraft Educational Evaluation Services

[SIGNATURE]

DISCLAIMER: This evaluation is advisory in nature and represents the opinion of the evaluator. Acceptance of this evaluation is at the discretion of the receiving institution or organization.`;
  };

  // State for the evaluation letter
  const [evaluationLetter, setEvaluationLetter] = useState<EvaluationLetterData & { letter_content?: string }>({
    client_name: '',
    university: '',
    country: '',
    bachelor_degree: '',
    degree_date1: '',
    us_equivalent_degree1: 'Bachelor of Science',
    additional_degree: false,
    university_location: '',
    field_of_study: '',
    program_length1: '4 years',
    years: '',
    specialty: '',
    work_experience_summary: [],
    accreditation_body: 'Ministry of Education',
    degree_level: 'undergraduate',
    letter_content: ''
  });
  
  // State for uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [processingError, setProcessingError] = useState('');
  
  // State for the active tab
  const [activeTab, setActiveTab] = useState('upload');
  
  // State for the evaluation letter ID
  const [evaluationLetterId, setEvaluationLetterId] = useState<string | null>(null);
  
  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
  // Create a new evaluation letter if one doesn't exist
  let letterId = evaluationLetterId;
  if (!letterId) {
    const newLetter = await evaluationLetterService.createEvaluationLetter({
      client_name: '',
      university: '',
      country: '',
      bachelor_degree: '',
      degree_date1: '',
      us_equivalent_degree1: 'Bachelor of Science',
      additional_degree: false,
      university_location: '',
      field_of_study: '',
      program_length1: '4 years',
      years: '',
      specialty: '',
      work_experience_summary: [],
      accreditation_body: 'Ministry of Education',
      degree_level: 'undergraduate'
    });
        
        letterId = newLetter.id;
        setEvaluationLetterId(letterId);
        setEvaluationLetter(newLetter);
      }
      
      // Upload each file
      const newDocuments = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Determine document type based on filename
        let documentType = 'other';
        if (file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('cv')) {
          documentType = 'resume';
        } else if (file.name.toLowerCase().includes('degree') || file.name.toLowerCase().includes('diploma')) {
          documentType = 'degree';
        } else if (file.name.toLowerCase().includes('transcript')) {
          documentType = 'transcript';
        }
        
        const uploadedDocument = await evaluationLetterService.uploadDocument(
          letterId as string,
          file,
          documentType
        );
        
        newDocuments.push(uploadedDocument);
      }
      
      setUploadedDocuments([...uploadedDocuments, ...newDocuments]);
      
      toast({
        title: 'Files uploaded successfully',
        description: `${files.length} file(s) have been uploaded.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error uploading files',
        description: error.message || 'An error occurred while uploading files.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Process documents
  const processDocuments = async () => {
    if (!evaluationLetterId) {
      toast({
        title: 'No evaluation letter',
        description: 'Please upload documents first to create an evaluation letter.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep('Extracting text from documents...');
    setProcessingError('');
    
    try {
      // Process documents with Azure Document Intelligence
      setProcessingProgress(20);
      const processResult = await evaluationLetterService.processDocuments(evaluationLetterId);
      
      // Extract data with Gemini
      setProcessingProgress(60);
      setProcessingStep('Analyzing documents with AI...');
      const extractionResult = await evaluationLetterService.extractDataWithAI(evaluationLetterId);
      
      // Update the evaluation letter state
      setEvaluationLetter(extractionResult.updatedLetter);
      
      setProcessingProgress(100);
      setProcessingStep('Processing complete!');
      
      // Switch to the edit tab
      setActiveTab('edit');
      
      toast({
        title: 'Documents processed successfully',
        description: 'AI has extracted information from your documents.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error processing documents:', error);
      setProcessingError(error.message || 'An error occurred while processing documents.');
      toast({
        title: 'Error processing documents',
        description: error.message || 'An error occurred while processing documents.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle form field changes
  const handleInputChange = (field: keyof EvaluationLetterData | 'letter_content', value: any) => {
    setEvaluationLetter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save changes to the evaluation letter
  const saveChanges = async () => {
    if (!evaluationLetterId) return;
    
    try {
      const updatedLetter = await evaluationLetterService.updateEvaluationLetter(
        evaluationLetterId,
        evaluationLetter
      );
      
      toast({
        title: 'Changes saved',
        description: 'Your changes have been saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error saving changes',
        description: error.message || 'An error occurred while saving changes.',
        variant: 'destructive',
      });
    }
  };
  
  // Generate and download the evaluation letter
  const generateLetter = async () => {
    if (!evaluationLetterId) return;
    
    try {
      const result = await evaluationLetterService.generateEvaluationLetter(evaluationLetterId);
      
      toast({
        title: 'Evaluation letter generated',
        description: `Your evaluation letter has been generated as a ${result.format.toUpperCase()} file.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating letter:', error);
      toast({
        title: 'Error generating letter',
        description: error.message || 'An error occurred while generating the letter.',
        variant: 'destructive',
      });
    }
  };
  
  // Add a work experience item
  const addWorkExperienceItem = () => {
    setEvaluationLetter(prev => ({
      ...prev,
      work_experience_summary: [...prev.work_experience_summary, '']
    }));
  };
  
  // Update a work experience item
  const updateWorkExperienceItem = (index: number, value: string) => {
    const newWorkExperience = [...evaluationLetter.work_experience_summary];
    newWorkExperience[index] = value;
    
    setEvaluationLetter(prev => ({
      ...prev,
      work_experience_summary: newWorkExperience
    }));
  };
  
  // Remove a work experience item
  const removeWorkExperienceItem = (index: number) => {
    const newWorkExperience = [...evaluationLetter.work_experience_summary];
    newWorkExperience.splice(index, 1);
    
    setEvaluationLetter(prev => ({
      ...prev,
      work_experience_summary: newWorkExperience
    }));
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">EvalLetterAI - Academic Evaluation Letter Generator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">1. Upload Documents</TabsTrigger>
          <TabsTrigger value="edit" disabled={!evaluationLetterId}>2. Edit Information</TabsTrigger>
          <TabsTrigger value="generate" disabled={!evaluationLetterId}>3. Generate Letter</TabsTrigger>
        </TabsList>
        
        {/* Upload Documents Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Academic Documents</CardTitle>
              <CardDescription>
                Upload academic transcripts, degrees, and resume/CV to extract information automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div 
                  className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported formats: PDF, DOCX, JPG, PNG
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </div>
              
              {isUploading && (
                <div className="mb-4">
                  <p className="text-sm mb-2">Uploading files...</p>
                  <Progress value={50} className="h-2" />
                </div>
              )}
              
              {uploadedDocuments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{doc.file_name}</span>
                        {doc.processed && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
                        {doc.processing_error && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Processing Documents</h3>
                  <p className="text-xs text-gray-500 mb-2">{processingStep}</p>
                  <Progress value={processingProgress} className="h-2 mb-2" />
                  
                  {processingError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{processingError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('edit')} disabled={!evaluationLetterId}>
                Skip to Edit
              </Button>
              <Button onClick={processDocuments} disabled={isProcessing || uploadedDocuments.length === 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Documents'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Edit Information Tab */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Extracted Information</CardTitle>
              <CardDescription>
                Review and edit the information extracted from your documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client_name">Full Name</Label>
                        <Input
                          id="client_name"
                          value={evaluationLetter.client_name}
                          onChange={(e) => handleInputChange('client_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialty">Field of Expertise</Label>
                        <Input
                          id="specialty"
                          value={evaluationLetter.specialty}
                          onChange={(e) => handleInputChange('specialty', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="years">Years of Experience</Label>
                        <Input
                          id="years"
                          value={evaluationLetter.years}
                          onChange={(e) => handleInputChange('years', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary Degree */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Primary Degree</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bachelor_degree">Degree Name</Label>
                        <Input
                          id="bachelor_degree"
                          value={evaluationLetter.bachelor_degree}
                          onChange={(e) => handleInputChange('bachelor_degree', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={evaluationLetter.university}
                          onChange={(e) => handleInputChange('university', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={evaluationLetter.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="degree_date1">Year of Graduation</Label>
                        <Input
                          id="degree_date1"
                          value={evaluationLetter.degree_date1}
                          onChange={(e) => handleInputChange('degree_date1', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="us_equivalent_degree1">U.S. Equivalent Degree</Label>
                        <Input
                          id="us_equivalent_degree1"
                          value={evaluationLetter.us_equivalent_degree1}
                          onChange={(e) => handleInputChange('us_equivalent_degree1', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="field_of_study">Field of Study</Label>
                        <Input
                          id="field_of_study"
                          value={evaluationLetter.field_of_study}
                          onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Degree */}
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="additional_degree"
                      checked={evaluationLetter.additional_degree}
                      onCheckedChange={(checked) => handleInputChange('additional_degree', checked)}
                    />
                    <Label htmlFor="additional_degree">Include Additional Degree</Label>
                  </div>
                  
                  {evaluationLetter.additional_degree && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 border rounded-md">
                      <div>
                        <Label htmlFor="additional_degree_name">Additional Degree Name</Label>
                        <Input
                          id="additional_degree_name"
                          value={typeof evaluationLetter.additional_degree === 'string' 
                            ? evaluationLetter.additional_degree 
                            : ''}
                          onChange={(e) => handleInputChange('additional_degree', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university2">University</Label>
                        <Input
                          id="university2"
                          value={evaluationLetter.university2 || ''}
                          onChange={(e) => handleInputChange('university2', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="degree_date2">Year of Graduation</Label>
                        <Input
                          id="degree_date2"
                          value={evaluationLetter.degree_date2 || ''}
                          onChange={(e) => handleInputChange('degree_date2', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="us_equivalent_degree2">U.S. Equivalent Degree</Label>
                        <Input
                          id="us_equivalent_degree2"
                          value={evaluationLetter.us_equivalent_degree2 || ''}
                          onChange={(e) => handleInputChange('us_equivalent_degree2', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="field_of_study2">Field of Study</Label>
                        <Input
                          id="field_of_study2"
                          value={evaluationLetter.field_of_study2 || ''}
                          onChange={(e) => handleInputChange('field_of_study2', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Work Experience */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Work Experience</h3>
                    <Button variant="outline" size="sm" onClick={addWorkExperienceItem}>
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {evaluationLetter.work_experience_summary.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Textarea
                          value={item}
                          onChange={(e) => updateWorkExperienceItem(index, e.target.value)}
                          className="flex-1"
                          placeholder="Work experience item"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkExperienceItem(index)}
                          className="mt-1"
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                    
                    {evaluationLetter.work_experience_summary.length === 0 && (
                      <p className="text-sm text-gray-500">No work experience items added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('upload')}>
                Back to Upload
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={saveChanges}>
                  Save Changes
                </Button>
                <Button onClick={() => setActiveTab('generate')}>
                  Continue to Generate
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Generate Letter Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Evaluation Letter</CardTitle>
              <CardDescription>
                Preview, edit, and generate your evaluation letter as a DOCX or PDF file.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col space-y-4">
                {/* Letter Editor/Preview Area */}
                <div className="border rounded-lg overflow-hidden">
                  <Tabs defaultValue="editor" className="w-full">
                    <div className="border-b px-4">
                      <TabsList>
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="editor" className="p-0">
                      <div className="bg-muted/30 p-2 border-b flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={generateLetter} disabled={isProcessing}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button variant="ghost" size="sm" disabled={isProcessing}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve
                        </Button>
                      </div>
                      
                      <Textarea
                        className="min-h-[400px] rounded-none border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                        placeholder="Your evaluation letter will appear here after processing..."
                        value={evaluationLetter.letter_content || getDefaultLetterContent()}
                        onChange={(e) => handleInputChange('letter_content', e.target.value)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="p-6 min-h-[400px]">
                      <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm border rounded-md">
                        <h1 className="text-2xl font-bold mb-6">Educational Evaluation Report</h1>
                        <div className="prose prose-sm">
                          {(evaluationLetter.letter_content || getDefaultLetterContent()).split("\n").map((paragraph, i) => (
                            <p key={i} className="mb-4">
                              {paragraph || <br />}
                            </p>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Export Options */}
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">Export Options</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="flex-1" onClick={generateLetter}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export as DOCX
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={generateLetter}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('edit')}>
                Back to Edit
              </Button>
              <Button onClick={saveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvalLetterAI;
