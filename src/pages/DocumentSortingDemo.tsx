import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDocumentSorter } from "@/components/EnhancedDocumentSorter";
import { FileText, FolderOpen } from "lucide-react";

// Sample document data
const sampleDocuments = [
  {
    id: "doc-1",
    name: "Resume_John_Smith.pdf",
    title: "Resume - John Smith",
    description: "Professional resume with 10 years of experience in software engineering",
    type: "resume",
    tags: ["software", "engineering", "leadership"],
    category: "resume",
    summary: "A comprehensive resume detailing 10 years of software engineering experience, including leadership roles at major tech companies and expertise in full-stack development.",
    extracted_text: "John Smith\nSenior Software Engineer\n\nExperience:\n- Lead Developer at Tech Corp (2018-Present)\n- Senior Engineer at Software Inc (2015-2018)\n- Developer at Code Solutions (2012-2015)\n\nSkills: JavaScript, React, Node.js, Python, AWS",
    uploadDate: "2023-05-10",
    confidence: 0.95
  },
  {
    id: "doc-2",
    name: "Masters_Degree_Certificate.pdf",
    title: "Master's Degree in Computer Science",
    description: "Master's degree from Stanford University",
    type: "degree",
    tags: ["education", "computer science", "stanford"],
    category: "degree",
    summary: "Master of Science in Computer Science degree from Stanford University, awarded in 2012 with specialization in artificial intelligence.",
    extracted_text: "Stanford University\nMaster of Science\nComputer Science\nAwarded to John Smith\nMay 15, 2012",
    uploadDate: "2023-05-10",
    confidence: 0.92
  },
  {
    id: "doc-3",
    name: "Employment_Letter_TechCorp.pdf",
    title: "Employment Verification - Tech Corp",
    description: "Employment verification letter from current employer",
    type: "employment",
    tags: ["verification", "employment", "tech corp"],
    category: "employment",
    summary: "Employment verification letter from Tech Corp confirming John Smith's position as Lead Developer since 2018, with details about responsibilities and achievements.",
    extracted_text: "Tech Corp\n123 Tech Street\nSan Francisco, CA\n\nTo Whom It May Concern:\n\nThis letter confirms that John Smith has been employed as a Lead Developer at Tech Corp since January 2018. He leads a team of 8 developers and has been instrumental in launching our flagship product.",
    uploadDate: "2023-05-11",
    confidence: 0.88
  },
  {
    id: "doc-4",
    name: "Recommendation_Letter_CEO.pdf",
    title: "Recommendation Letter from CEO",
    description: "Professional recommendation from the CEO of Tech Corp",
    type: "support",
    tags: ["recommendation", "leadership", "CEO"],
    summary: "Strong recommendation letter from the CEO of Tech Corp highlighting John's exceptional leadership skills and technical expertise.",
    extracted_text: "As the CEO of Tech Corp, I am pleased to provide this letter of recommendation for John Smith. John has consistently demonstrated exceptional leadership and technical skills during his time at our company.",
    uploadDate: "2023-05-12",
    confidence: 0.91
  },
  {
    id: "doc-5",
    name: "Industry_Award_Certificate.pdf",
    title: "Best Developer Award 2022",
    description: "Industry recognition for outstanding contributions",
    type: "recognition",
    tags: ["award", "recognition", "industry"],
    summary: "Certificate for the 'Best Developer Award 2022' presented at the Annual Tech Innovation Conference for outstanding contributions to open-source software.",
    extracted_text: "Tech Innovation Conference\nBest Developer Award 2022\nPresented to John Smith\nFor outstanding contributions to open-source software and innovation in cloud computing",
    uploadDate: "2023-05-12",
    confidence: 0.85
  },
  {
    id: "doc-6",
    name: "Conference_Presentation.pdf",
    title: "AI Conference Presentation",
    description: "Slides from keynote presentation at AI Conference 2022",
    type: "presentation",
    tags: ["conference", "AI", "presentation"],
    summary: "Keynote presentation slides from the International AI Conference 2022, where John presented research on machine learning applications in software development.",
    extracted_text: "International AI Conference 2022\nKeynote Presentation\nMachine Learning Applications in Modern Software Development\nPresented by John Smith\n\nAgenda:\n1. Introduction to ML in DevOps\n2. Case Studies\n3. Implementation Strategies\n4. Future Directions",
    uploadDate: "2023-05-13",
    confidence: 0.79
  },
  {
    id: "doc-7",
    name: "Patent_Filing_ML_Algorithm.pdf",
    title: "Patent Filing - ML Algorithm",
    description: "Patent application for a novel machine learning algorithm",
    type: "patent",
    tags: ["patent", "innovation", "machine learning"],
    summary: "Patent application filing for a novel machine learning algorithm developed by John Smith that improves code optimization in large-scale applications.",
    extracted_text: "United States Patent and Trademark Office\nPatent Application\n\nTitle: Method and System for Optimizing Code Execution Using Predictive Machine Learning\nInventor: John Smith\n\nAbstract: A novel machine learning algorithm that analyzes code patterns and execution metrics to automatically optimize performance in large-scale applications.",
    uploadDate: "2023-05-14",
    confidence: 0.82
  },
  {
    id: "doc-8",
    name: "Tech_Journal_Publication.pdf",
    title: "Publication in Tech Journal",
    description: "Research paper published in a prestigious tech journal",
    type: "publication",
    tags: ["publication", "research", "journal"],
    summary: "Research paper titled 'Advancements in Distributed Computing Architectures' published in the International Journal of Computer Science, Volume 45, Issue 3.",
    extracted_text: "International Journal of Computer Science\nVolume 45, Issue 3\n\nAdvancements in Distributed Computing Architectures\nAuthors: John Smith, Jane Doe\n\nAbstract: This paper presents novel approaches to distributed computing architectures that improve scalability and fault tolerance in cloud environments.",
    uploadDate: "2023-05-15",
    confidence: 0.93
  }
];

// Document categories
const documentCategories = [
  { id: "resume", title: "Resume", icon: "user" },
  { id: "degree", title: "Degree & Diplomas", icon: "graduation-cap" },
  { id: "license", title: "License & Membership", icon: "id-card" },
  { id: "employment", title: "Employment Records", icon: "briefcase" },
  { id: "support", title: "Support Letters", icon: "envelope" },
  { id: "recognition", title: "Recognitions", icon: "award" },
  { id: "media", title: "Press Media", icon: "newspaper" }
];

export default function DocumentSortingDemo() {
  const [documents, setDocuments] = useState(sampleDocuments);
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  
  // Handle saving categorized documents
  const handleSaveCategories = (categorizedDocuments: any[]) => {
    setDocuments(categorizedDocuments);
    setIsSorterOpen(false);
  };
  
  // Count documents in each category
  const getCategoryCount = (categoryId: string) => {
    return documents.filter(doc => doc.category === categoryId).length;
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Sorting Demo</h1>
            <p className="text-muted-foreground mt-2">
              Experience the new visual, interactive document sorting interface
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => setIsSorterOpen(true)}
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            Open Document Sorter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {documentCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {getCategoryCount(category.id)} document(s)
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {documents
                    .filter(doc => doc.category === category.id)
                    .slice(0, 3)
                    .map(doc => (
                      <div key={doc.id} className="p-2 border rounded-md text-sm">
                        {doc.title || doc.name}
                      </div>
                    ))}
                  {getCategoryCount(category.id) > 3 && (
                    <div className="text-center text-sm text-muted-foreground">
                      +{getCategoryCount(category.id) - 3} more documents
                    </div>
                  )}
                  {getCategoryCount(category.id) === 0 && (
                    <div className="text-center p-4 text-sm text-muted-foreground">
                      No documents in this category
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Uncategorized */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                Uncategorized
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {documents.filter(doc => !doc.category).length} document(s)
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {documents
                  .filter(doc => !doc.category)
                  .slice(0, 3)
                  .map(doc => (
                    <div key={doc.id} className="p-2 border rounded-md text-sm">
                      {doc.title || doc.name}
                    </div>
                  ))}
                {documents.filter(doc => !doc.category).length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{documents.filter(doc => !doc.category).length - 3} more documents
                  </div>
                )}
                {documents.filter(doc => !doc.category).length === 0 && (
                  <div className="text-center p-4 text-sm text-muted-foreground">
                    No uncategorized documents
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About This Demo</h2>
          <p className="mb-4">
            This demo showcases the new document sorting experience with the following features:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Visual side-by-side layout with documents on the left and categories on the right</li>
            <li>Smooth drag-and-drop functionality with animations</li>
            <li>Document previews with AI-generated summaries</li>
            <li>Search functionality to quickly find documents</li>
            <li>Visual feedback when dragging documents over categories</li>
            <li>Detailed document viewer with extracted text and metadata</li>
          </ul>
          <p>
            Click the "Open Document Sorter" button above to try the new experience.
          </p>
        </div>
      </div>
      
      {/* Enhanced Document Sorter */}
      <EnhancedDocumentSorter
        isOpen={isSorterOpen}
        onClose={() => setIsSorterOpen(false)}
        documents={documents}
        categories={documentCategories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
}
