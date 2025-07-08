import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import ocrService, { OCRResult, TranscriptData } from '../services/ocrService';

interface TranscriptUploaderProps {
  onUploadComplete?: (data: TranscriptData) => void;
  onUploadError?: (error: string) => void;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'parsing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

const TranscriptUploader: React.FC<TranscriptUploaderProps> = ({
  onUploadComplete,
  onUploadError
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<TranscriptData | null>(null);

  const processFile = async (file: File) => {
    try {
      setUploadStatus({
        status: 'uploading',
        progress: 10,
        message: 'Uploading document...'
      });

      // Step 1: OCR Processing
      setUploadStatus({
        status: 'processing',
        progress: 30,
        message: 'Processing document with OCR...'
      });

      const ocrResults = await ocrService.processDocument(file);

      // Step 2: Data Extraction
      setUploadStatus({
        status: 'parsing',
        progress: 70,
        message: 'Extracting transcript data...'
      });

      const transcriptData = await ocrService.extractTranscriptData(ocrResults);

      // Step 3: Validation
      setUploadStatus({
        status: 'parsing',
        progress: 90,
        message: 'Validating extracted data...'
      });

      const validation = ocrService.validateTranscriptData(transcriptData);

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Complete
      setUploadStatus({
        status: 'complete',
        progress: 100,
        message: 'Document processed successfully!'
      });

      setExtractedData(transcriptData);
      onUploadComplete?.(transcriptData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: 'Processing failed',
        error: errorMessage
      });
      onUploadError?.(errorMessage);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFiles([file]);
      processFile(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
    handleFileSelect(event.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
    setUploadedFiles([]);
    setExtractedData(null);
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
      case 'processing':
      case 'parsing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
      case 'processing':
      case 'parsing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Upload Academic Transcript</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploadStatus.status !== 'idle' ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".png,.jpg,.jpeg,.gif,.bmp,.pdf,.doc,.docx"
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-4">
              {getStatusIcon()}
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the transcript here' : 'Drag & drop your transcript'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, Word documents, and images (PNG, JPG, etc.)
                </p>
              </div>
              {uploadStatus.status === 'idle' && (
                <Button variant="outline">
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadStatus.status !== 'idle' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {uploadStatus.message}
                </span>
                {uploadStatus.status === 'complete' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Progress value={uploadStatus.progress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {uploadStatus.status === 'error' && uploadStatus.error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadStatus.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Summary */}
          {uploadStatus.status === 'complete' && extractedData && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">Processing Complete</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Student:</strong> {extractedData.studentInfo.firstName} {extractedData.studentInfo.lastName}</p>
                <p><strong>Institution:</strong> {extractedData.institutionInfo.name}</p>
                <p><strong>Courses Found:</strong> {extractedData.courses.length}</p>
                <p><strong>OCR Confidence:</strong> {extractedData.metadata.ocrConfidence}%</p>
              </div>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{file.name}</span>
                    <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptUploader;
