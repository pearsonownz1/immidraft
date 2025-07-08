import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Search, Filter, Eye, FileText, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TranscriptUploader from '../components/TranscriptUploader';
import { TranscriptData } from '../services/ocrService';

interface StudentRecord {
  id: string;
  taskLink: string;
  uploaded: string;
  source: string;
  country: string;
  institution: string;
  studentName: string;
  educationLevel: string;
  gpa: string;
  credits: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Error';
  edited: string;
}

const EvaluateAI: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: StudentRecord[] = [
      {
        id: '1',
        taskLink: '7:59 PM Today',
        uploaded: '7:59 PM Today',
        source: 'MAPit',
        country: 'Vietnam',
        institution: 'College Of Education',
        studentName: 'Demo Sample STUDENT',
        educationLevel: '---',
        gpa: '---',
        credits: '---',
        status: 'Completed',
        edited: '---'
      },
      {
        id: '2',
        taskLink: '7:59 PM Today',
        uploaded: '7:59 PM Today',
        source: 'MAPit',
        country: 'India',
        institution: 'Amrita Vishwa Vidyapeetham University',
        studentName: 'Demo Sample STUDENT',
        educationLevel: '---',
        gpa: '---',
        credits: '---',
        status: 'Completed',
        edited: '---'
      },
      {
        id: '3',
        taskLink: '7:59 PM Today',
        uploaded: '7:59 PM Today',
        source: 'MAPit',
        country: 'United States',
        institution: 'Olympic Team High School',
        studentName: 'Demo Sample STUDENT',
        educationLevel: '---',
        gpa: '---',
        credits: '---',
        status: 'Completed',
        edited: '---'
      },
      {
        id: '4',
        taskLink: '7:59 PM Today',
        uploaded: '7:59 PM Today',
        source: 'MAPit',
        country: 'Australia',
        institution: 'Monash University',
        studentName: 'Demo Sample STUDENT',
        educationLevel: '---',
        gpa: '---',
        credits: '---',
        status: 'Completed',
        edited: '---'
      },
      {
        id: '5',
        taskLink: '7:59 PM Today',
        uploaded: '7:59 PM Today',
        source: 'MAPit',
        country: 'United States',
        institution: 'Eden Prairie High School',
        studentName: 'Demo Sample STUDENT',
        educationLevel: '---',
        gpa: '---',
        credits: '---',
        status: 'Completed',
        edited: '---'
      }
    ];
    
    setTimeout(() => {
      setStudents(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: StudentRecord['status']) => {
    const variants = {
      'Completed': 'default',
      'Processing': 'secondary',
      'Pending': 'outline',
      'Error': 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Vietnam': '🇻🇳',
      'India': '🇮🇳',
      'United States': '🇺🇸',
      'Australia': '🇦🇺',
      'China': '🇨🇳'
    };
    return flags[country] || '🌍';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleViewStudent = (studentId: string) => {
    navigate(`/evaluate-ai/student/${studentId}`);
  };

  const handleTranscriptProcessed = (transcriptData: TranscriptData) => {
    // Create a new student record from the processed transcript
    const newStudent: StudentRecord = {
      id: Date.now().toString(),
      taskLink: new Date().toLocaleTimeString(),
      uploaded: new Date().toLocaleTimeString(),
      source: 'Upload',
      country: transcriptData.institutionInfo.address?.includes('USA') ? 'United States' : 'Unknown',
      institution: transcriptData.institutionInfo.name,
      studentName: `${transcriptData.studentInfo.firstName} ${transcriptData.studentInfo.lastName}`,
      educationLevel: transcriptData.academicInfo.degreeLevel,
      gpa: transcriptData.academicInfo.gpa?.toFixed(2) || '---',
      credits: transcriptData.courses.reduce((sum, course) => sum + course.credits, 0).toString(),
      status: 'Completed',
      edited: '---'
    };

    // Add to the beginning of the students list
    setStudents(prev => [newStudent, ...prev]);
    setShowUploader(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could show a toast notification here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">EvaluateAI</h1>
              <p className="text-blue-100">Automated Academic Transcript Analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Would you recommend the use of EvaluateAI at your institution?
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Drag and drop files below to scan your transcript.
            </div>
            <Button 
              onClick={() => setShowUploader(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Transcript</span>
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task link</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Country / State</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Student name</TableHead>
                  <TableHead>Education level</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Edited</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.taskLink}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{student.uploaded}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCountryFlag(student.country)}</span>
                        <span>{student.country}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{student.institution}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.educationLevel}</TableCell>
                    <TableCell>{student.gpa}</TableCell>
                    <TableCell>{student.credits}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>{student.edited}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student.id)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>For any questions please email: <a href="mailto:info@immidraft.com" className="text-blue-600 hover:underline">info@immidraft.com</a></p>
          <p className="mt-1">© 2024 by ImmiDraft Inc.</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload New Transcript</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploader(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <TranscriptUploader
              onUploadComplete={handleTranscriptProcessed}
              onUploadError={handleUploadError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluateAI;
