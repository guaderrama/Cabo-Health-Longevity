import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const timestamp = Date.now();
  const uniqueEmail = `user.test.${timestamp}@gmail.com`;
  const password = 'TestPassword123!@#';

  console.log('\n🧪 TEST: Registro con email único');
  console.log('='.repeat(60));
  console.log(`Email: ${uniqueEmail}`);
  console.log(`Password: ${password}\n`);

  console.log('1️⃣ Intentando registro en Supabase Auth...');

  const { data, error: authError } = await supabase.auth.signUp({
    email: uniqueEmail,
    password: password,
    options: {
      data: { role: 'patient', name: 'Test User' },
      emailRedirectTo: 'https://cabo-health-longevity.vercel.app/auth/callback',
    },
  });

  if (authError) {
    console.log('❌ ERROR en signUp:');
    console.log(`   Mensaje: ${authError.message}`);
    console.log(`   Código: ${authError.code || 'N/A'}`);
    console.log(`   Status: ${authError.status || 'N/A'}`);
    console.log('\n📋 Error completo:', JSON.stringify(authError, null, 2));
    process.exit(1);
  }

  if (!data.user) {
    console.log('❌ No se creó el usuario (data.user es null)');
    process.exit(1);
  }

  console.log('✅ Usuario creado en Auth');
  console.log(`   ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);
  console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'SÍ' : 'NO'}`);

  console.log('\n2️⃣ Intentando INSERT en tabla patients...');

  const { data: insertResult, error: insertError } = await supabase
    .from('patients')
    .insert({
      id: data.user.id,
      email: uniqueEmail,
      name: 'Test User',
      phone: '1234567890',
      birth_date: '1990-01-01',
      gender: 'male',
    });

  if (insertError) {
    console.log('❌ ERROR en INSERT:');
    console.log(`   Mensaje: ${insertError.message}`);
    console.log(`   Código: ${insertError.code}`);
    console.log(`   Details: ${insertError.details}`);
    console.log('\n📋 Error completo:', JSON.stringify(insertError, null, 2));

    console.log('\n🔄 Cerrando sesión del usuario huérfano...');
    await supabase.auth.signOut();

    process.exit(1);
  }

  console.log('✅ Perfil creado en tabla patients');

  console.log('\n3️⃣ Verificando datos en Supabase...');

  const { data: patientData, error: queryError } = await supabase
    .from('patients')
    .select('*')
    .eq('email', uniqueEmail)
    .single();

  if (queryError) {
    console.log('⚠️ Error al verificar:', queryError.message);
  } else {
    console.log('✅ Paciente encontrado:');
    console.log(`   ID: ${patientData.id}`);
    console.log(`   Email: ${patientData.email}`);
    console.log(`   Nombre: ${patientData.name}`);
    console.log(`   Teléfono: ${patientData.phone}`);
    console.log(`   Fecha Nacimiento: ${patientData.birth_date}`);
    console.log(`   Género: ${patientData.gender}`);
  }

  await supabase.auth.signOut();

  console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
  console.log('='.repeat(60));
  console.log(`\n💡 Para probar en la UI, usa:`);
  console.log(`   URL: https://cabo-health-longevity.vercel.app/register`);
  console.log(`   Email: user.test.${Date.now()}@gmail.com`);
  console.log(`   (Genera un timestamp nuevo cada vez)\n`);
})();
