interface OCRResult {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
  type?: 'text' | 'table' | 'header' | 'cell';
  tableInfo?: {
    rowIndex: number;
    colIndex: number;
    rowSpan: number;
    colSpan: number;
  };
}

interface TableStructure {
  rows: number;
  cols: number;
  cells: Array<{
    text: string;
    confidence: number;
    bbox: [number, number, number, number];
    rowIndex: number;
    colIndex: number;
    rowSpan: number;
    colSpan: number;
  }>;
  headers: string[];
}

interface TranscriptData {
  studentInfo: {
    firstName: string;
    lastName: string;
    studentId?: string;
    dateOfBirth?: string;
  };
  institutionInfo: {
    name: string;
    address?: string;
    phone?: string;
  };
  academicInfo: {
    degreeName: string;
    degreeLevel: string;
    major: string;
    gpa?: number;
    graduationDate?: string;
    admissionDate?: string;
  };
  courses: Array<{
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
    year: number;
  }>;
  metadata: {
    ocrConfidence: number;
    processingDate: string;
    documentType: string;
  };
}

class OCRService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_OCR_API_ENDPOINT || '/api/ocr';
  }

  /**
   * Process document using PaddleOCR
   */
  async processDocument(file: File): Promise<OCRResult[]> {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${this.apiEndpoint}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.ocrResults || [];
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  /**
   * Extract structured data from OCR results
   */
  async extractTranscriptData(ocrResults: OCRResult[]): Promise<TranscriptData> {
    try {
      // Use AI to parse the OCR text into structured data
      const response = await fetch('/api/parse-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ocrResults }),
      });

      if (!response.ok) {
        throw new Error(`Transcript parsing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transcript parsing error:', error);
      throw error;
    }
  }

  /**
   * Calculate GPA using different scales
   */
  calculateGPA(courses: any[], scale: '4.0' | '5.0' | 'percentage' = '4.0'): number {
    if (!courses.length) return 0;

    const gradePoints: { [key: string]: number } = {
      'A+': scale === '4.0' ? 4.0 : 5.0,
      'A': scale === '4.0' ? 4.0 : 5.0,
      'A-': scale === '4.0' ? 3.7 : 4.7,
      'B+': scale === '4.0' ? 3.3 : 4.3,
      'B': scale === '4.0' ? 3.0 : 4.0,
      'B-': scale === '4.0' ? 2.7 : 3.7,
      'C+': scale === '4.0' ? 2.3 : 3.3,
      'C': scale === '4.0' ? 2.0 : 3.0,
      'C-': scale === '4.0' ? 1.7 : 2.7,
      'D+': scale === '4.0' ? 1.3 : 2.3,
      'D': scale === '4.0' ? 1.0 : 2.0,
      'F': 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const points = gradePoints[course.grade] || 0;
      const credits = course.credits || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  /**
   * Convert grades between different systems
   */
  convertGrade(grade: string, fromSystem: string, toSystem: string): string {
    // Grade conversion logic based on international standards
    const conversionMap: { [key: string]: { [key: string]: { [key: string]: string } } } = {
      'indian': {
        'us': {
          'O': 'A+', 'A+': 'A+', 'A': 'A', 'B+': 'B+', 'B': 'B',
          'C+': 'C+', 'C': 'C', 'D': 'D', 'F': 'F'
        }
      },
      'uk': {
        'us': {
          'First': 'A', 'Upper Second': 'B+', 'Lower Second': 'B',
          'Third': 'C', 'Pass': 'D', 'Fail': 'F'
        }
      }
    };

    return conversionMap[fromSystem]?.[toSystem]?.[grade] || grade;
  }

  /**
   * Categorize courses using SCED/CIP codes
   */
  categorizeCourse(courseName: string, courseCode: string): {
    category: string;
    subcategory: string;
    sced?: string;
    cip?: string;
  } {
    // Basic categorization logic - would be enhanced with ML/AI
    const categories = {
      'Mathematics': {
        keywords: ['math', 'calculus', 'algebra', 'geometry', 'statistics'],
        sced: '02',
        cip: '27'
      },
      'Science': {
        keywords: ['physics', 'chemistry', 'biology', 'science'],
        sced: '03',
        cip: '40'
      },
      'English': {
        keywords: ['english', 'literature', 'writing', 'composition'],
        sced: '01',
        cip: '23'
      },
      'Social Studies': {
        keywords: ['history', 'geography', 'social', 'government'],
        sced: '04',
        cip: '45'
      },
      'Engineering': {
        keywords: ['engineering', 'mechanical', 'electrical', 'civil'],
        sced: '21',
        cip: '14'
      }
    };

    const courseText = `${courseName} ${courseCode}`.toLowerCase();
    
    for (const [category, data] of Object.entries(categories)) {
      if (data.keywords.some(keyword => courseText.includes(keyword))) {
        return {
          category,
          subcategory: category,
          sced: data.sced,
          cip: data.cip
        };
      }
    }

    return {
      category: 'Other',
      subcategory: 'General',
    };
  }

  /**
   * Validate extracted data
   */
  validateTranscriptData(data: TranscriptData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.studentInfo.firstName || !data.studentInfo.lastName) {
      errors.push('Student name is required');
    }

    if (!data.institutionInfo.name) {
      errors.push('Institution name is required');
    }

    if (!data.courses.length) {
      errors.push('At least one course is required');
    }

    // Data quality checks
    if (data.metadata.ocrConfidence < 80) {
      warnings.push('Low OCR confidence - manual review recommended');
    }

    data.courses.forEach((course, index) => {
      if (!course.courseCode || !course.courseName) {
        warnings.push(`Course ${index + 1}: Missing course code or name`);
      }
      if (!course.credits || course.credits <= 0) {
        warnings.push(`Course ${index + 1}: Invalid credit hours`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate transcript summary
   */
  generateSummary(data: TranscriptData): {
    totalCredits: number;
    gpa: number;
    courseCount: number;
    degreeInfo: string;
    completionStatus: string;
  } {
    const totalCredits = data.courses.reduce((sum, course) => sum + (course.credits || 0), 0);
    const gpa = this.calculateGPA(data.courses);
    const courseCount = data.courses.length;
    
    const degreeInfo = `${data.academicInfo.degreeLevel} in ${data.academicInfo.major}`;
    const completionStatus = data.academicInfo.graduationDate ? 'Completed' : 'In Progress';

    return {
      totalCredits,
      gpa: Math.round(gpa * 100) / 100,
      courseCount,
      degreeInfo,
      completionStatus
    };
  }
}

export default new OCRService();
export type { OCRResult, TranscriptData };
