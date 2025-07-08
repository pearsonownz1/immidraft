import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, Download, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface CourseGrade {
  courseCode: string;
  courseName: string;
  courseLevel: string;
  gradeLevel: string;
  credits: number;
  grade: string;
  points: number;
  year: number;
  academicTerm: string;
  highlighted?: boolean;
}

interface StudentData {
  id: string;
  lastName: string;
  firstName: string;
  institution: string;
  institutionOrig: string;
  country: string;
  usState: string;
  degreeName: string;
  degreeLevel: string;
  generalEducationLevel: string;
  programFieldOfStudy: string;
  majorSpecialization: string;
  yearOfAdmission: number;
  yearOfCompletion: number;
  dateOfIssue: string;
  ocrConfidence: number;
  myDocsId: string;
  courses: CourseGrade[];
}

const StudentDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockStudentData: StudentData = {
      id: studentId || '1',
      lastName: 'STUDENT',
      firstName: 'Demo Sample',
      institution: 'Amrita Vishwa Vidyapeetham University',
      institutionOrig: 'Amrita Vishwa Vidyapeetham University',
      country: 'India',
      usState: '',
      degreeName: 'Bachelor Of Technology',
      degreeLevel: "Bachelor's",
      generalEducationLevel: '',
      programFieldOfStudy: 'Mechanical Engineering',
      majorSpecialization: '',
      yearOfAdmission: 2009,
      yearOfCompletion: 2013,
      dateOfIssue: '11/06/2014',
      ocrConfidence: 93,
      myDocsId: '50...',
      courses: [
        {
          courseCode: 'HU15',
          courseName: 'Communicative English',
          courseLevel: '',
          gradeLevel: '',
          credits: 3.0,
          grade: 'B',
          points: 0,
          year: 2009,
          academicTerm: 'Fall',
          highlighted: true
        },
        {
          courseCode: 'PH100',
          courseName: 'Physics',
          courseLevel: '',
          gradeLevel: '',
          credits: 3.0,
          grade: 'B',
          points: 0,
          year: 2009,
          academicTerm: 'Fall'
        },
        {
          courseCode: 'MA101',
          courseName: 'Calculus and Matrix Algebra',
          courseLevel: '',
          gradeLevel: '',
          credits: 4.0,
          grade: 'B',
          points: 0,
          year: 2009,
          academicTerm: 'Fall',
          highlighted: true
        },
        {
          courseCode: 'EE100',
          courseName: 'Electrical Engineering',
          courseLevel: '',
          gradeLevel: '',
          credits: 3.0,
          grade: 'B',
          points: 0,
          year: 2009,
          academicTerm: 'Fall'
        },
        {
          courseCode: 'ME101',
          courseName: 'Engineering Graphics',
          courseLevel: '',
          gradeLevel: '',
          credits: 2.0,
          grade: 'A',
          points: 0,
          year: 2009,
          academicTerm: 'Fall'
        }
      ]
    };

    setTimeout(() => {
      setStudentData(mockStudentData);
      setLoading(false);
    }, 1000);
  }, [studentId]);

  const handleBackToTranscripts = () => {
    navigate('/evaluate-ai');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleSave = () => {
    // Save logic here
    setEditMode(false);
  };

  const handleClose = () => {
    navigate('/evaluate-ai');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
          <Button onClick={handleBackToTranscripts} className="mt-4">
            Back to Transcripts
          </Button>
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBackToTranscripts}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Transcripts</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </Button>
          </div>
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            {studentData.lastName}, {studentData.firstName}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Data Extraction Review</span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>OCR avg. confidence: {studentData.ocrConfidence}%</span>
                    <span>•</span>
                    <span>MyDocs ID: {studentData.myDocsId}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Loading document preview...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Extracted Data */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Institution Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">INSTITUTION</label>
                    <p className="mt-1 font-medium">{studentData.institution}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">YEAR OF ADMISSION</label>
                    <p className="mt-1 font-medium">{studentData.yearOfAdmission}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">INSTITUTION (ORIG.)</label>
                    <p className="mt-1 text-gray-700">{studentData.institutionOrig}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">YEAR OF COMPLETION</label>
                    <p className="mt-1 font-medium">{studentData.yearOfCompletion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">COUNTRY</label>
                    <p className="mt-1 font-medium">{studentData.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">DATE OF ISSUE</label>
                    <p className="mt-1 font-medium">{studentData.dateOfIssue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">US STATE</label>
                    <p className="mt-1 text-gray-700">{studentData.usState || '---'}</p>
                  </div>
                </div>

                <Separator />

                {/* Degree Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">DEGREE NAME</label>
                    <p className="mt-1 font-medium">{studentData.degreeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">DEGREE LEVEL</label>
                    <p className="mt-1 font-medium">{studentData.degreeLevel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">GENERAL EDUCATION LEVEL</label>
                    <p className="mt-1 text-gray-700">{studentData.generalEducationLevel || '---'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PROGRAM / FIELD OF STUDY</label>
                    <p className="mt-1 font-medium">{studentData.programFieldOfStudy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">MAJOR / SPECIALIZATION</label>
                    <p className="mt-1 text-gray-700">{studentData.majorSpecialization || '---'}</p>
                  </div>
                </div>

                <Separator />

                {/* Grades Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Grades</h3>
                  
                  {/* Semester Header */}
                  <div className="bg-gray-100 p-3 rounded-t-lg">
                    <h4 className="font-medium">SEMESTER: FALL, 2009</h4>
                  </div>

                  {/* Grades Table */}
                  <div className="border border-t-0 rounded-b-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>COURSE LEVEL</TableHead>
                          <TableHead>GRADE LEVEL</TableHead>
                          <TableHead>CREDITS</TableHead>
                          <TableHead>GRADE</TableHead>
                          <TableHead>POINTS</TableHead>
                          <TableHead>YEAR</TableHead>
                          <TableHead>ACADEMIC TERM</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentData.courses.map((course, index) => (
                          <TableRow 
                            key={index} 
                            className={course.highlighted ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{course.courseCode}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  {course.highlighted && (
                                    <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                  )}
                                  {course.courseName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{course.gradeLevel || '---'}</TableCell>
                            <TableCell>{course.credits.toFixed(1)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{course.grade}</Badge>
                            </TableCell>
                            <TableCell>{course.points}</TableCell>
                            <TableCell>{course.year}</TableCell>
                            <TableCell>{course.academicTerm}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <span className="text-gray-400">⋮</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <span>Approve and Go to Calculations</span>
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download as</span>
                    </Button>
                    <Button className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
