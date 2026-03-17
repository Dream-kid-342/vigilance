import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('./.env', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
    acc[key.trim()] = value;
  }
  return acc;
}, {});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseAnonKey = envVars['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing Supabase Insert...");
  
  // Try to insert a dummy profile with a random UUID
  const dummyId = '11111111-1111-1111-1111-111111111111'; // Note: This might violate the foreign key to auth.users if it doesn't exist, but we should see the error type
  const { data, error } = await supabase.from('profiles').insert([{
    id: dummyId,
    full_name: 'Test Setup',
    email: 'test@setup.com',
    role: 'client'
  }]);

  if (error) {
    console.error("Error inserting profile:");
    console.error(error);
  } else {
    console.log("Insert successful! Data:", data);
  }
}

testInsert();
