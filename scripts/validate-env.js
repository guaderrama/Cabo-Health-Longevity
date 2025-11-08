#!/usr/bin/env node

/**
 * ✅ CRITICAL FIX: Validate required environment variables at build time
 * This prevents deploying broken builds to production
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

console.log('🔍 Validating environment variables...\n');

const missing = [];
const present = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];

  if (!value || value.trim() === '') {
    missing.push(varName);
    console.error(`❌ Missing: ${varName}`);
  } else {
    present.push(varName);
    // Show partial value for verification (hide sensitive parts)
    const maskedValue = value.length > 10
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : '***';
    console.log(`✅ Found: ${varName} = ${maskedValue}`);
  }
});

console.log('');

if (missing.length > 0) {
  console.error('╔════════════════════════════════════════════════════════════════╗');
  console.error('║  ❌ ERROR: Missing Required Environment Variables             ║');
  console.error('╚════════════════════════════════════════════════════════════════╝\n');
  console.error('Missing variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  console.error('\n📝 To fix this, create a .env file in the project root:\n');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n');
  console.error('You can find these values in your Supabase project settings:');
  console.error('https://app.supabase.com/project/_/settings/api\n');

  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  ✅ All required environment variables are set!                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

process.exit(0);
