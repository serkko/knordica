const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found');
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
const supabase = createClient(url, key);

async function checkLeadsTable() {
  console.log('--- DETAILED LEADS SCHEMA CHECK ---');
  
  // Fetch one row from leads
  const { data: leads, error: leadsErr } = await supabase.from('leads').select('*').limit(1);
  if (leadsErr) {
    console.error('❌ Error selecting from leads:', leadsErr.message);
    return;
  }
  
  if (leads && leads.length > 0) {
    const dbColumns = Object.keys(leads[0]);
    console.log('✅ Leads DB Columns:', dbColumns);
    
    // Check key fields
    const requiredFields = [
      'id', 'full_name', 'email', 'phone', 'whatsapp', 'stage', 'client_type',
      'budget_min', 'budget_max', 'budget_currency', 'interested_zones',
      'interested_types', 'notes', 'next_action', 'next_action_date',
      'priority', 'source', 'req_bedrooms', 'req_bathrooms', 'req_parking',
      'bath_preference', 'cedula_rif', 'preferred_payment', 'urgency'
    ];
    
    console.log('\n--- TS INTERFACE TO DB ALIGNMENT ---');
    requiredFields.forEach(f => {
      const exists = dbColumns.includes(f);
      console.log(`- ${f}: ${exists ? '✅ DB matches TS key' : '❌ DB MISSING KEY'}`);
    });
  } else {
    console.log('✅ Table "leads" exists but is empty. We will query using RPC or mock data.');
  }
}

checkLeadsTable();
