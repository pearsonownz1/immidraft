// Export all document sorting components
export { DocumentCategorySorter } from "../DocumentCategorySorter";
export { DocumentCategoryPanel } from "../DocumentCategoryPanel";
export { DocumentSorter } from "../DocumentSorter";

// Export the demo page
import DocumentSortingDemo from "../../pages/DocumentSortingDemo";
export { DocumentSortingDemo };

// Export types
export interface Document {
  id: string;
  name: string;
  type: string;
  size?: string;
  uploadDate?: string;
  category?: string;
  title?: string;
  description?: string;
  tags?: string[];
  criteria?: string[];
  summary?: string;
  extracted_text?: string;
  ai_tags?: string[];
  file_url?: string;
}

export interface Category {
  id: string;
  title: string;
  icon?: string;
  count?: number;
}
