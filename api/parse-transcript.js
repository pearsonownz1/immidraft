export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { ocrResults } = req.body;

    if (!ocrResults || !Array.isArray(ocrResults)) {
      return res.status(400).json({ error: 'OCR results are required' });
    }

    console.log('Processing OCR results for transcript parsing:', ocrResults.length, 'items');

    // Extract text from OCR results
    const fullText = ocrResults.map(result => result.text).join(' ');
    console.log('Full extracted text:', fullText.substring(0, 200) + '...');

    // Parse student information using regex patterns
    const studentInfo = extractStudentInfo(fullText, ocrResults);
    const institutionInfo = extractInstitutionInfo(fullText, ocrResults);
    const academicInfo = extractAcademicInfo(fullText, ocrResults);
    const courses = extractCourses(ocrResults);

    // Calculate overall confidence
    const avgConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length;

    const transcriptData = {
      studentInfo,
      institutionInfo,
      academicInfo,
      courses,
      metadata: {
        ocrConfidence: Math.round(avgConfidence),
        processingDate: new Date().toISOString(),
        documentType: 'academic_transcript'
      }
    };

    console.log('Successfully parsed transcript data:', {
      student: studentInfo.firstName + ' ' + studentInfo.lastName,
      institution: institutionInfo.name,
      courses: courses.length
    });

    return res.status(200).json(transcriptData);

  } catch (error) {
    console.error('Error parsing transcript:', error);
    return res.status(500).json({ error: 'Failed to parse transcript data' });
  }
}

function extractStudentInfo(fullText, ocrResults) {
  // Look for name patterns
  const namePatterns = [
    /Name:\s*([A-Za-z\s,]+)/i,
    /Student:\s*([A-Za-z\s,]+)/i,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/
  ];

  let firstName = null;
  let lastName = null;

  for (const pattern of namePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const fullName = match[1].trim();
      if (fullName.includes(',')) {
        const parts = fullName.split(',').map(p => p.trim());
        lastName = parts[0];
        firstName = parts[1] || null;
      } else {
        const parts = fullName.split(' ').map(p => p.trim());
        firstName = parts[0] || null;
        lastName = parts[1] || null;
      }
      break;
    }
  }

  // Look for student ID
  const idMatch = fullText.match(/(?:Student\s*ID|ID|Student\s*Number):\s*([A-Z0-9]+)/i);
  const studentId = idMatch ? idMatch[1] : null;

  // Look for date of birth
  const dobMatch = fullText.match(/(?:Date\s*of\s*Birth|DOB|Born):\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const dateOfBirth = dobMatch ? dobMatch[1] : null;

  return {
    firstName,
    lastName,
    studentId,
    dateOfBirth
  };
}

function extractInstitutionInfo(fullText, ocrResults) {
  // Look for institution name in headers or early text
  const institutionPatterns = [
    /University of ([A-Za-z\s]+)/i,
    /([A-Za-z\s]+)\s+University/i,
    /([A-Za-z\s]+)\s+College/i,
    /([A-Za-z\s]+)\s+Institute/i
  ];

  let institutionName = null;

  for (const pattern of institutionPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      institutionName = match[0].trim();
      break;
    }
  }

  return {
    name: institutionName,
    address: null,
    phone: null
  };
}

function extractAcademicInfo(fullText, ocrResults) {
  // Look for degree information
  const degreePatterns = [
    /Bachelor\s+of\s+([A-Za-z\s]+)/i,
    /Master\s+of\s+([A-Za-z\s]+)/i,
    /([A-Za-z\s]+)\s+Degree/i,
    /Program:\s*([A-Za-z\s]+)/i,
    /Major:\s*([A-Za-z\s]+)/i
  ];

  let degreeName = null;
  let major = null;

  for (const pattern of degreePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      if (pattern.source.includes('Bachelor')) {
        degreeName = match[0];
        major = match[1].trim();
      } else if (pattern.source.includes('Master')) {
        degreeName = match[0];
        major = match[1].trim();
      } else if (pattern.source.includes('Program') || pattern.source.includes('Major')) {
        major = match[1].trim();
      }
      break;
    }
  }

  // Look for GPA
  const gpaMatch = fullText.match(/(?:GPA|Grade\s*Point\s*Average):\s*(\d+\.?\d*)/i);
  const gpa = gpaMatch ? parseFloat(gpaMatch[1]) : null;

  // Look for graduation date
  const gradMatch = fullText.match(/(?:Graduation|Graduated|Degree\s*Date):\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const graduationDate = gradMatch ? gradMatch[1] : null;

  return {
    degreeName,
    degreeLevel: degreeName && degreeName.toLowerCase().includes('master') ? 'Master' : degreeName && degreeName.toLowerCase().includes('bachelor') ? 'Bachelor' : null,
    major,
    gpa,
    graduationDate,
    admissionDate: null
  };
}

function extractCourses(ocrResults) {
  const courses = [];
  
  // Look for table-like structures or course patterns
  const coursePatterns = [
    /([A-Z]{2,4}\d{3,4})\s+([A-Za-z\s]+)\s+(\d+)\s+([A-F][+-]?)/g,
    /([A-Z]{2,4}\s*\d{3,4})\s+([A-Za-z\s]+)\s+(\d+)\s+([A-F][+-]?)/g
  ];

  const fullText = ocrResults.map(r => r.text).join(' ');
  
  for (const pattern of coursePatterns) {
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      courses.push({
        courseCode: match[1].trim(),
        courseName: match[2].trim(),
        credits: parseInt(match[3]) || 3,
        grade: match[4].trim(),
        semester: 'Fall',
        year: 2023
      });
    }
  }

  // If no courses found using patterns, generate some based on OCR content
  if (courses.length === 0) {
    const sampleCourses = generateSampleCourses(fullText);
    courses.push(...sampleCourses);
  }

  return courses;
}

function generateSampleCourses(fullText) {
  // Don't generate fake courses - return empty array if no real courses found
  console.log('No courses could be extracted from the document text');
  return [];
}
