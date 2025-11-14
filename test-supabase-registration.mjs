import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('🔐 Test de Registro en Supabase\n');
  console.log('='.repeat(80));

  const timestamp = Date.now();
  const testEmail = `test.patient.${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!@#';
  const role = 'patient';
  const name = 'Test Patient';
  const phone = '1234567890';
  const dateOfBirth = '1990-01-01';

  console.log('\n📝 Datos de prueba:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Role: ${role}`);
  console.log(`   Name: ${name}\n`);

  try {
    // Step 1: Sign up user
    console.log('🔵 PASO 1: Creando usuario en Auth...');
    const { data, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { role, name },
        emailRedirectTo: 'https://cabo-health-longevity.vercel.app/auth/callback',
      },
    });

    if (authError) {
      console.error('❌ ERROR EN AUTH SIGNUP:', authError);
      console.error('   Message:', authError.message);
      console.error('   Code:', authError.code || 'N/A');
      console.error('   Status:', authError.status || 'N/A');
      console.error('\n   Full error:', JSON.stringify(authError, null, 2));
      process.exit(1);
    }

    if (!data.user) {
      console.error('❌ ERROR: No se creó el usuario (data.user es null)');
      process.exit(1);
    }

    console.log('✅ Usuario creado en Auth exitosamente');
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'YES' : 'NO'}`);
    console.log(`   Needs Confirmation: ${!data.user.email_confirmed_at}\n`);

    // Step 2: Insert into patients table
    console.log('🔵 PASO 2: Insertando perfil en tabla patients...');

    const insertData = {
      id: data.user.id,
      email: testEmail,
      name,
      phone,
      date_of_birth: dateOfBirth,
    };

    console.log('   Datos a insertar:');
    console.log('   ' + JSON.stringify(insertData, null, 2).replace(/\n/g, '\n   '));

    const { data: insertResult, error: insertError } = await supabase
      .from('patients')
      .insert(insertData);

    if (insertError) {
      console.error('\n❌ ERROR EN INSERT:');
      console.error('   Message:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
      console.error('\n   Full error:', JSON.stringify(insertError, null, 2));

      // Try to sign out
      console.log('\n🔄 Intentando cerrar sesión del usuario huérfano...');
      await supabase.auth.signOut();
      console.log('✅ Sesión cerrada\n');

      console.log('='.repeat(80));
      console.log('\n🔍 DIAGNÓSTICO:');

      if (insertError.code === '42501') {
        console.log('   ❌ PROBLEMA: Row Level Security (RLS) está bloqueando el INSERT');
        console.log('   📋 SOLUCIÓN: Necesitas agregar una política RLS que permita INSERT');
        console.log('              durante el signup (cuando auth.uid() = user.id)');
      } else if (insertError.code === '23505') {
        console.log('   ❌ PROBLEMA: El usuario ya existe en la tabla patients');
        console.log('   📋 SOLUCIÓN: Elimina el registro duplicado o usa un email diferente');
      } else if (insertError.code === '23502') {
        console.log('   ❌ PROBLEMA: Falta un campo requerido (NOT NULL constraint)');
        console.log('   📋 SOLUCIÓN: Verifica que todos los campos required tengan valor');
      } else {
        console.log(`   ❌ PROBLEMA: Error desconocido (código: ${insertError.code})`);
        console.log('   📋 SOLUCIÓN: Revisa los detalles del error arriba');
      }

      process.exit(1);
    }

    console.log('✅ Perfil creado exitosamente en tabla patients\n');
    console.log('='.repeat(80));
    console.log('\n🎉 REGISTRO COMPLETADO CON ÉXITO!\n');

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Sesión cerrada\n');

  } catch (error) {
    console.error('\n💥 ERROR INESPERADO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
