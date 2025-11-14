import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('🔍 Verificando esquema de tablas patients y doctors\n');
  console.log('='.repeat(80));

  console.log('\n📋 Probando SELECT en tabla PATIENTS...');
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .limit(1);

  if (patientsError) {
    console.error('❌ Error:', patientsError.message);
  } else if (patientsData && patientsData.length > 0) {
    console.log('✅ Columnas encontradas en patients:');
    console.log('   ' + Object.keys(patientsData[0]).join(', '));
  } else {
    console.log('⚠️ La tabla está vacía, intentando INSERT para ver columnas disponibles...');

    // Try to insert with empty object to see what columns are required
    const { error: testError } = await supabase
      .from('patients')
      .insert({});

    if (testError) {
      console.log('   Error message:', testError.message);
      console.log('   Code:', testError.code);
      console.log('   Details:', testError.details);
    }
  }

  console.log('\n📋 Probando SELECT en tabla DOCTORS...');
  const { data: doctorsData, error: doctorsError } = await supabase
    .from('doctors')
    .select('*')
    .limit(1);

  if (doctorsError) {
    console.error('❌ Error:', doctorsError.message);
  } else if (doctorsData && doctorsData.length > 0) {
    console.log('✅ Columnas encontradas en doctors:');
    console.log('   ' + Object.keys(doctorsData[0]).join(', '));
  } else {
    console.log('⚠️ La tabla está vacía, intentando INSERT para ver columnas disponibles...');

    const { error: testError } = await supabase
      .from('doctors')
      .insert({});

    if (testError) {
      console.log('   Error message:', testError.message);
      console.log('   Code:', testError.code);
      console.log('   Details:', testError.details);
    }
  }

  console.log('\n' + '='.repeat(80));
})();
