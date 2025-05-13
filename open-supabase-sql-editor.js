import open from 'open';

// Open the Supabase SQL Editor
const projectId = 'nhlvmzurgvkiltpzycyt';
const sqlEditorUrl = `https://app.supabase.com/project/${projectId}/sql`;

console.log(`Opening Supabase SQL Editor at: ${sqlEditorUrl}`);
console.log('Please copy and paste the contents of supabase-schema.sql into the SQL Editor and run it.');

open(sqlEditorUrl);
