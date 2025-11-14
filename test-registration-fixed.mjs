import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('🔐 Test de Registro - Intentando con diferentes columnas\n');
  console.log('='.repeat(80));

  const timestamp = Date.now();
  const testEmail = `test.patient.${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!@#';

  console.log(`\n📝 Email: ${testEmail}\n`);

  try {
    // Sign up
    console.log('🔵 Creando usuario en Auth...');
    const { data, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { role: 'patient', name: 'Test Patient' },
        emailRedirectTo: 'https://cabo-health-longevity.vercel.app/auth/callback',
      },
    });

    if (authError || !data.user) {
      console.error('❌ Error:', authError);
      process.exit(1);
    }

    console.log('✅ Usuario creado:', data.user.id);

    // Try different column names for birth_date
    const possibleData = [
      // Try 1: birth_date
      {
        id: data.user.id,
        email: testEmail,
        name: 'Test Patient',
        phone: '1234567890',
        birth_date: '1990-01-01',
        gender: 'male',
      },
      // Try 2: date_of_birth
      {
        id: data.user.id,
        email: testEmail,
        name: 'Test Patient',
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
      },
      // Try 3: dateOfBirth
      {
        id: data.user.id,
        email: testEmail,
        name: 'Test Patient',
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male',
      },
      // Try 4: birthdate
      {
        id: data.user.id,
        email: testEmail,
        name: 'Test Patient',
        phone: '1234567890',
        birthdate: '1990-01-01',
        gender: 'male',
      },
      // Try 5: sin fecha de nacimiento
      {
        id: data.user.id,
        email: testEmail,
        name: 'Test Patient',
        phone: '1234567890',
        gender: 'male',
      },
    ];

    for (let i = 0; i < possibleData.length; i++) {
      const testData = possibleData[i];
      const birthField = Object.keys(testData).find(k => k.includes('birth') || k.includes('date'));

      console.log(`\n🔵 INTENTO ${i + 1}: ${birthField || 'sin campo de fecha'}`);
      console.log('   Datos:', JSON.stringify(testData, null, 2).substring(0, 200));

      const { data: result, error } = await supabase
        .from('patients')
        .insert(testData);

      if (error) {
        console.log(`   ❌ Error:`, error.message);
        console.log(`   Code:`, error.code);
      } else {
        console.log(`   ✅ ¡ÉXITO! Configuración que funciona:`);
        console.log('   ', JSON.stringify(testData, null, 2));

        await supabase.auth.signOut();
        console.log('\n🎉 REGISTRO COMPLETADO\n');
        process.exit(0);
      }
    }

    console.log('\n❌ Ninguna configuración funcionó.');
    await supabase.auth.signOut();
    process.exit(1);

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    process.exit(1);
  }
})();
