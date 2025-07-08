import { TranscriptData } from '../../services/ocrService';

interface OCRResult {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export async function parseTranscript(ocrResults: OCRResult[]): Promise<TranscriptData> {
  // Extract all text from OCR results
  const allText = ocrResults.map(result => result.text).join(' ');
  
  // Mock AI parsing - replace with actual AI service call
  const mockTranscriptData: TranscriptData = {
    studentInfo: {
      firstName: extractField(allText, /Name:\s*(\w+),\s*(\w+)/, 2) || 'Thomas',
      lastName: extractField(allText, /Name:\s*(\w+),\s*(\w+)/, 1) || 'Smith',
      studentId: extractField(allText, /Student ID:\s*(\w+)/) || undefined,
      dateOfBirth: extractField(allText, /Date of Birth:\s*([\d\/]+)/) || '1/2/01',
    },
    institutionInfo: {
      name: extractField(allText, /School Name\/Address:\s*([^,\n]+)/) || 'Franklin High School',
      address: extractField(allText, /Address:\s*([^\n]+)/) || undefined,
    },
    academicInfo: {
      degreeName: 'High School Diploma',
      degreeLevel: 'Secondary',
      major: 'General Studies',
      gpa: calculateGPAFromText(allText),
      graduationDate: extractField(allText, /Graduation Date:\s*([\d\/]+)/) || undefined,
      admissionDate: extractField(allText, /Admission Date:\s*([\d\/]+)/) || undefined,
    },
    courses: extractCourses(ocrResults),
    metadata: {
      ocrConfidence: calculateAverageConfidence(ocrResults),
      processingDate: new Date().toISOString(),
      documentType: 'High School Transcript',
    },
  };

  return mockTranscriptData;
}

function extractField(text: string, regex: RegExp, groupIndex: number = 1): string | undefined {
  const match = text.match(regex);
  return match ? match[groupIndex] : undefined;
}

function calculateGPAFromText(text: string): number {
  // Look for GPA patterns in text
  const gpaMatch = text.match(/GPA:\s*([\d.]+)/i);
  if (gpaMatch) {
    return parseFloat(gpaMatch[1]);
  }
  
  // Calculate from grades if no explicit GPA found
  const gradeMatches = text.match(/\b[ABCDF][+-]?\b/g);
  if (gradeMatches) {
    const gradePoints = gradeMatches.map(grade => {
      switch (grade.charAt(0)) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'F': return 0.0;
        default: return 0.0;
      }
    });
    return gradePoints.reduce((sum, points) => sum + points, 0) / gradePoints.length;
  }
  
  return 0.0;
}

function extractCourses(ocrResults: OCRResult[]): Array<{
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
  year: number;
}> {
  const courses = [];
  
  // Look for course patterns in OCR results
  for (let i = 0; i < ocrResults.length; i++) {
    const result = ocrResults[i];
    
    // Pattern: Course code followed by course name
    const courseMatch = result.text.match(/^(\d{4})\s+(.+)/);
    if (courseMatch) {
      const courseCode = courseMatch[1];
      const courseName = courseMatch[2];
      
      // Look for grade in nearby results
      let grade = 'A';
      let credits = 1.0;
      
      // Check next few results for grade and credits
      for (let j = i + 1; j < Math.min(i + 5, ocrResults.length); j++) {
        const nextResult = ocrResults[j];
        
        // Look for grade pattern
        const gradeMatch = nextResult.text.match(/^[ABCDF][+-]?$/);
        if (gradeMatch) {
          grade = gradeMatch[0];
        }
        
        // Look for credits pattern
        const creditsMatch = nextResult.text.match(/^([\d.]+)$/);
        if (creditsMatch) {
          credits = parseFloat(creditsMatch[1]);
        }
      }
      
      courses.push({
        courseCode,
        courseName: courseName.replace(/-(H|CP|AP)$/, '').trim(),
        credits,
        grade,
        semester: 'Fall',
        year: 2018,
      });
    }
  }
  
  // If no courses found, add some mock data
  if (courses.length === 0) {
    courses.push(
      {
        courseCode: '1002',
        courseName: 'English 9 Honors',
        credits: 1.0,
        grade: 'A',
        semester: 'Fall',
        year: 2018,
      },
      {
        courseCode: '1134',
        courseName: 'Spanish II College Prep',
        credits: 1.0,
        grade: 'A',
        semester: 'Fall',
        year: 2018,
      }
    );
  }
  
  return courses;
}

function calculateAverageConfidence(ocrResults: OCRResult[]): number {
  if (ocrResults.length === 0) return 0;
  
  const totalConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0);
  return Math.round((totalConfidence / ocrResults.length) * 100);
}

// API handler for transcript parsing
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ocrResults } = req.body;
    
    if (!ocrResults || !Array.isArray(ocrResults)) {
      return res.status(400).json({ error: 'Invalid OCR results' });
    }

    const transcriptData = await parseTranscript(ocrResults);
    
    res.status(200).json(transcriptData);
  } catch (error) {
    console.error('Transcript parsing error:', error);
    res.status(500).json({ 
      error: 'Transcript parsing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
