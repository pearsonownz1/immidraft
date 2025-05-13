export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_first_name: string
          client_last_name: string
          client_email: string
          client_phone: string
          client_company: string
          visa_type: string
          status: string
          beneficiary_name: string
          petitioner_name: string
          job_title: string
          job_description: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_first_name: string
          client_last_name: string
          client_email: string
          client_phone: string
          client_company: string
          visa_type: string
          status?: string
          beneficiary_name: string
          petitioner_name: string
          job_title: string
          job_description: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_first_name?: string
          client_last_name?: string
          client_email?: string
          client_phone?: string
          client_company?: string
          visa_type?: string
          status?: string
          beneficiary_name?: string
          petitioner_name?: string
          job_title?: string
          job_description?: string
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          case_id: string
          name: string
          size: string
          type: string
          url: string
          tags: string[]
          criteria: string[]
          extracted_text?: string
          summary?: string
          ai_tags?: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          case_id: string
          name: string
          size: string
          type: string
          url: string
          tags?: string[]
          criteria?: string[]
          extracted_text?: string
          summary?: string
          ai_tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          case_id?: string
          name?: string
          size?: string
          type?: string
          url?: string
          tags?: string[]
          criteria?: string[]
          extracted_text?: string
          summary?: string
          ai_tags?: string[]
        }
      }
      criteria: {
        Row: {
          id: string
          created_at: string
          visa_type: string
          title: string
          description: string
          category: string
          required_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          visa_type: string
          title: string
          description: string
          category: string
          required_count: number
        }
        Update: {
          id?: string
          created_at?: string
          visa_type?: string
          title?: string
          description?: string
          category?: string
          required_count?: number
        }
      }
      document_criteria: {
        Row: {
          id: string
          created_at: string
          document_id: string
          criterion_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          document_id: string
          criterion_id: string
        }
        Update: {
          id?: string
          created_at?: string
          document_id?: string
          criterion_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
