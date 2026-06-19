// Simple Supabase Database Connection Checker for Knordica
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env.local');

console.log('Loading environment variables from:', envPath);

if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value;
  }
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from .env.local');
  process.exit(1);
}

if (key === 'YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD' || key.includes('YOUR_ANON')) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is still set to placeholder value!');
  process.exit(1);
}

console.log('Connecting to Supabase at:', url);
console.log('Using Anon Key (prefix):', key.substring(0, 15) + '...');

const supabase = createClient(url, key);

async function testConnection() {
  try {
    console.log('Attempting to query table "zones"...');
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name_es')
      .limit(5);

    if (zonesError) {
      console.error('Database connection worked, but table query failed. Check if migrations were run!');
      console.error('Error details:', zonesError.message);
      return;
    }

    console.log('\nSUCCESS! Successfully queried "zones" table.');
    console.log('Found zones in DB:', zones);

    console.log('\nAttempting to query table "properties"...');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, slug, price')
      .limit(2);

    if (propError) {
      console.error('Error querying properties:', propError.message);
    } else {
      console.log('SUCCESS! Successfully queried "properties" table.');
      console.log('Properties in DB:', properties);
    }
  } catch (err) {
    console.error('Unexpected connection exception:', err.message);
  }
}

testConnection();
