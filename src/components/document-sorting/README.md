# Document Sorting Components

This package provides components for manual document sorting and categorization in the ImmiDraft application.

## Components

### 1. DocumentCategoryPanel

A sidebar component that displays document categories and allows users to drag and drop documents between categories.

![DocumentCategoryPanel](https://via.placeholder.com/400x300?text=DocumentCategoryPanel)

**Features:**
- Display documents organized by categories
- Drag and drop documents between categories
- Click on categories to filter documents
- Open document sorter modal for bulk sorting

### 2. DocumentCategorySorter

A modal dialog that allows users to sort multiple documents into categories at once.

![DocumentCategorySorter](https://via.placeholder.com/400x300?text=DocumentCategorySorter)

**Features:**
- Grid view of all categories
- Drag and drop documents between categories
- Save or cancel changes

### 3. DocumentSorter

A full-featured document sorting modal with tabs for different views.

![DocumentSorter](https://via.placeholder.com/400x300?text=DocumentSorter)

**Features:**
- "All Documents" view showing all documents in a grid
- "By Category" view for sorting documents into categories
- Upload new documents directly from the sorter
- Drag and drop interface for document sorting

## Usage

### Basic Integration

```tsx
import { useState } from 'react';
import { 
  DocumentCategoryPanel, 
  Document, 
  Category 
} from '@/components/document-sorting';

// Sample document categories
const documentCategories: Category[] = [
  { id: "doc-1", title: "1 - Resume", icon: "user" },
  { id: "doc-2", title: "2 - Degree & Diplomas", icon: "graduation-cap" },
  // Add more categories as needed
];

// Your component
function MyComponent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Handle document updates (including category changes)
  const handleUpdateDocuments = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
    // Save to database or state management
  };
  
  return (
    <div className="flex h-screen">
      {/* Left sidebar with document categories */}
      <div className="w-80 bg-white border-r">
        <DocumentCategoryPanel
          documents={documents}
          categories={documentCategories}
          onUpdateDocuments={handleUpdateDocuments}
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          onUploadDocument={() => {/* Handle document upload */}}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 p-6">
        {/* Your document display/editing UI */}
      </div>
    </div>
  );
}
```

### Using the DocumentCategorySorter Modal

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DocumentCategorySorter, 
  Document, 
  Category 
} from '@/components/document-sorting';

function MyComponent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  
  // Handle saving categorized documents
  const handleSaveCategories = (sortedDocuments: Document[]) => {
    setDocuments(sortedDocuments);
    // Save to database or state management
  };
  
  return (
    <div>
      <Button onClick={() => setIsSorterOpen(true)}>
        Sort Documents
      </Button>
      
      <DocumentCategorySorter
        isOpen={isSorterOpen}
        onClose={() => setIsSorterOpen(false)}
        documents={documents}
        categories={documentCategories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
}
```

## Demo

A complete demo is available in the `DocumentSortingDemo` component:

```tsx
import { DocumentSortingDemo } from '@/components/document-sorting';

function App() {
  return <DocumentSortingDemo />;
}
```

## Implementation Details

The document sorting components use React's drag and drop API for a smooth user experience. Documents can be dragged between categories, and the changes are tracked in state until the user saves them.

Each component is designed to be flexible and can be integrated into different parts of the application as needed.
