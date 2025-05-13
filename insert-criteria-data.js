import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = 'https://nhlvmzurgvkiltpzycyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHZtenVyZ3ZraWx0cHp5Y3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzIyNTEsImV4cCI6MjA2MjE0ODI1MX0.HNKZrhf8Ho8_0sclJZoePGTHgiSeoEP-7ZnZYnqc3Z0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Insert criteria data
async function insertCriteriaData() {
  try {
    console.log('Inserting criteria data...');
    
    // Insert O-1A criteria
    const o1aCriteria = [
      {
        visa_type: 'o1a',
        title: 'National or International Award',
        description: 'Evidence of receipt of nationally or internationally recognized prizes or awards for excellence in the field of endeavor.',
        category: 'Extraordinary Ability Evidence',
        required_count: 3
      },
      {
        visa_type: 'o1a',
        title: 'Membership in Prestigious Associations',
        description: 'Evidence of membership in associations in the field that require outstanding achievements of their members, as judged by recognized experts.',
        category: 'Extraordinary Ability Evidence',
        required_count: 2
      },
      {
        visa_type: 'o1a',
        title: 'Published Material About the Beneficiary',
        description: 'Published material about the beneficiary in professional or major trade publications or other major media.',
        category: 'Extraordinary Ability Evidence',
        required_count: 3
      },
      {
        visa_type: 'o1a',
        title: 'Original Contributions of Major Significance',
        description: 'Evidence of the beneficiary\'s original scientific, scholarly, artistic, athletic, or business-related contributions of major significance in the field.',
        category: 'Professional Background',
        required_count: 4
      },
      {
        visa_type: 'o1a',
        title: 'Scholarly Articles',
        description: 'Evidence of the beneficiary\'s authorship of scholarly articles in the field, in professional or major trade publications or other major media.',
        category: 'Professional Background',
        required_count: 2
      },
      {
        visa_type: 'o1a',
        title: 'High Salary or Remuneration',
        description: 'Evidence that the beneficiary has commanded a high salary or other significantly high remuneration for services, in relation to others in the field.',
        category: 'Salary and Commercial Success',
        required_count: 2
      },
      {
        visa_type: 'o1a',
        title: 'Commercial Success in Performing Arts',
        description: 'Evidence of commercial successes in the performing arts, as shown by box office receipts or record, cassette, compact disk, or video sales.',
        category: 'Salary and Commercial Success',
        required_count: 3
      }
    ];
    
    const { data: o1aData, error: o1aError } = await supabase
      .from('criteria')
      .insert(o1aCriteria);
    
    if (o1aError) {
      console.error('Error inserting O-1A criteria:', o1aError);
    } else {
      console.log('O-1A criteria inserted successfully!');
    }
    
    // Insert EB-1A criteria
    const eb1aCriteria = [
      {
        visa_type: 'eb1a',
        title: 'Major International Award',
        description: 'Receipt of a major, internationally recognized award, such as the Nobel Prize.',
        category: 'Extraordinary Ability Evidence',
        required_count: 1
      },
      {
        visa_type: 'eb1a',
        title: 'Membership in Elite Organizations',
        description: 'Membership in organizations that require outstanding achievements of their members, as judged by recognized national or international experts.',
        category: 'Professional Associations',
        required_count: 2
      },
      {
        visa_type: 'eb1a',
        title: 'Published Material About You',
        description: 'Published material in professional publications written by others about your work in the field.',
        category: 'Media Recognition',
        required_count: 3
      },
      {
        visa_type: 'eb1a',
        title: 'Judging the Work of Others',
        description: 'Evidence that you have been asked to judge the work of others in your field.',
        category: 'Professional Activities',
        required_count: 2
      },
      {
        visa_type: 'eb1a',
        title: 'Original Scientific Contributions',
        description: 'Evidence of your original scientific, scholarly, or business-related contributions of major significance.',
        category: 'Contributions to Field',
        required_count: 3
      },
      {
        visa_type: 'eb1a',
        title: 'Scholarly Articles',
        description: 'Evidence of your authorship of scholarly articles in your field, in professional journals or other major media.',
        category: 'Publications',
        required_count: 3
      },
      {
        visa_type: 'eb1a',
        title: 'Artistic Exhibitions',
        description: 'Evidence of the display of your work at artistic exhibitions or showcases.',
        category: 'Artistic Recognition',
        required_count: 2
      },
      {
        visa_type: 'eb1a',
        title: 'Leading Role in Distinguished Organizations',
        description: 'Evidence that you have performed in a leading or critical role for organizations with distinguished reputations.',
        category: 'Leadership',
        required_count: 2
      },
      {
        visa_type: 'eb1a',
        title: 'High Salary',
        description: 'Evidence that you command a high salary or other high remuneration in relation to others in the field.',
        category: 'Compensation',
        required_count: 2
      },
      {
        visa_type: 'eb1a',
        title: 'Commercial Success in Performing Arts',
        description: 'Evidence of commercial success in the performing arts.',
        category: 'Commercial Success',
        required_count: 2
      }
    ];
    
    const { data: eb1aData, error: eb1aError } = await supabase
      .from('criteria')
      .insert(eb1aCriteria);
    
    if (eb1aError) {
      console.error('Error inserting EB-1A criteria:', eb1aError);
    } else {
      console.log('EB-1A criteria inserted successfully!');
    }
    
    console.log('Criteria data insertion completed');
  } catch (error) {
    console.error('Error inserting criteria data:', error);
  }
}

// Run the insertion
insertCriteriaData();
