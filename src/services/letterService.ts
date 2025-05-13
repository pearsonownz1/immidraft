import { supabase } from '@/lib/supabase';

export interface Letter {
  id?: string;
  title: string;
  content: string;
  client_name?: string;
  visa_type: string;
  letter_type: 'petition' | 'expert';
  beneficiary_name?: string;
  petitioner_name?: string;
  document_ids?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export const letterService = {
  /**
   * Get all letters
   * @returns Array of letters
   */
  async getLetters(): Promise<Letter[]> {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching letters:', error);
      return [];
    }
  },
  
  /**
   * Get a letter by ID
   * @param id Letter ID
   * @returns Letter object or null if not found
   */
  async getLetterById(id: string): Promise<Letter | null> {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching letter with ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Create a new letter
   * @param letter Letter object to create
   * @returns Created letter with ID or null if creation failed
   */
  async createLetter(letter: Letter): Promise<Letter | null> {
    try {
      const { data, error } = await supabase
        .from('letters')
        .insert([letter])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating letter:', error);
      return null;
    }
  },
  
  /**
   * Update an existing letter
   * @param id Letter ID
   * @param updates Partial letter object with fields to update
   * @returns Updated letter or null if update failed
   */
  async updateLetter(id: string, updates: Partial<Letter>): Promise<Letter | null> {
    try {
      const { data, error } = await supabase
        .from('letters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error updating letter with ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Delete a letter
   * @param id Letter ID
   * @returns True if deletion was successful, false otherwise
   */
  async deleteLetter(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting letter with ID ${id}:`, error);
      return false;
    }
  }
};
