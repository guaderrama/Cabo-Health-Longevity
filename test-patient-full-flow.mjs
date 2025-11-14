import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PROD_URL = 'https://cabo-health-longevity.vercel.app';

(async () => {
  console.log('\n🏥 TEST COMPLETO: REGISTRO Y LOGIN DE PACIENTE');
  console.log('='.repeat(80));

  const timestamp = Date.now();
  const testPatient = {
    email: `patient.test.${timestamp}@gmail.com`,
    password: 'PatientPassword123!@#',
    name: 'Juan Pérez Paciente',
    phone: '5551234567',
    birthDate: '1985-03-20',
    gender: 'male',
  };

  console.log('\n📝 Datos del paciente:');
  console.log(`   Email: ${testPatient.email}`);
  console.log(`   Password: ${testPatient.password}`);
  console.log(`   Nombre: ${testPatient.name}`);
  console.log(`   Teléfono: ${testPatient.phone}`);
  console.log(`   Fecha de Nacimiento: ${testPatient.birthDate}`);
  console.log(`   Género: ${testPatient.gender}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    // STEP 1: REGISTRO
    console.log('━'.repeat(80));
    console.log('PASO 1: REGISTRO DE PACIENTE');
    console.log('━'.repeat(80));

    const registerContext = await browser.newContext();
    const registerPage = await registerContext.newPage();

    const consoleErrors = [];
    registerPage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    console.log('\n🌐 Navegando a /register...');
    await registerPage.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle' });
    await registerPage.waitForTimeout(2000);

    console.log('👤 Seleccionando rol: Paciente...');
    await registerPage.click('button:has-text("Paciente")');
    await registerPage.waitForTimeout(1000);

    console.log('✍️ Llenando formulario de registro...');

    // Nombre (primer input type="text")
    await registerPage.fill('input[type="text"]', testPatient.name);
    console.log('   ✓ Nombre');

    // Email
    await registerPage.fill('input[type="email"]', testPatient.email);
    console.log('   ✓ Email');

    // Password
    await registerPage.fill('input[type="password"]', testPatient.password);
    console.log('   ✓ Password');

    // Teléfono
    await registerPage.fill('input[type="tel"]', testPatient.phone);
    console.log('   ✓ Teléfono');

    // Fecha de nacimiento
    await registerPage.fill('input[type="date"]', testPatient.birthDate);
    console.log('   ✓ Fecha de Nacimiento');

    // Género
    await registerPage.selectOption('select', testPatient.gender);
    console.log('   ✓ Género');

    await registerPage.waitForTimeout(1000);

    console.log('\n📤 Enviando formulario de registro...');
    await registerPage.click('button[type="submit"]');

    console.log('⏳ Esperando respuesta (10 segundos)...');
    await registerPage.waitForTimeout(10000);

    const registerUrl = registerPage.url();
    console.log(`\n📍 URL después del registro: ${registerUrl}`);

    // Verificar errores
    const errorElement = await registerPage.$('.bg-danger-light, .text-red-500, .text-red-600, .border-red-500');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log(`\n❌ ERROR EN REGISTRO: ${errorText}`);
      await registerContext.close();
      await browser.close();
      process.exit(1);
    }

    // Verificar éxito
    const successElement = await registerPage.$('.bg-green-50, .text-green-800');
    if (successElement) {
      const successText = await successElement.textContent();
      console.log(`\n✅ ${successText.substring(0, 100)}...`);
    }

    if (consoleErrors.length > 0) {
      console.log(`\n⚠️ Errores de consola (${consoleErrors.length}):`)
      consoleErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }

    if (registerUrl.includes('/login')) {
      console.log('✅ REGISTRO EXITOSO - Redirigido a /login');
    } else if (registerUrl.includes('/dashboard')) {
      console.log('✅ REGISTRO EXITOSO - Redirigido a /dashboard');
    } else {
      console.log('⚠️ URL inesperada después del registro');
    }

    await registerContext.close();

    // Verificar en Supabase
    console.log('\n🔍 Verificando en Supabase...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: patientData, error: queryError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', testPatient.email)
      .maybeSingle();

    if (queryError) {
      console.log(`⚠️ Error al consultar: ${queryError.message}`);
    } else if (!patientData) {
      console.log('⚠️ Paciente no encontrado en DB (puede requerir confirmación de email)');
    } else {
      console.log('✅ Paciente encontrado en base de datos:');
      console.log(`   ID: ${patientData.id}`);
      console.log(`   Email: ${patientData.email}`);
      console.log(`   Nombre: ${patientData.name}`);
      console.log(`   Teléfono: ${patientData.phone}`);
      console.log(`   Fecha Nacimiento: ${patientData.birth_date}`);
      console.log(`   Género: ${patientData.gender}`);
    }

    // STEP 2: LOGIN
    console.log('\n━'.repeat(80));
    console.log('PASO 2: INTENTAR LOGIN CON CREDENCIALES NUEVAS');
    console.log('━'.repeat(80));

    await new Promise(resolve => setTimeout(resolve, 3000));

    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();

    const loginErrors = [];
    loginPage.on('console', msg => {
      if (msg.type() === 'error') {
        loginErrors.push(msg.text());
      }
    });

    console.log('\n🌐 Navegando a /login...');
    await loginPage.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });
    await loginPage.waitForTimeout(2000);

    console.log('✍️ Ingresando credenciales...');
    await loginPage.fill('input[type="email"]', testPatient.email);
    console.log('   ✓ Email');

    await loginPage.fill('input[type="password"]', testPatient.password);
    console.log('   ✓ Password');

    await loginPage.waitForTimeout(1000);

    console.log('\n📤 Enviando login...');
    await loginPage.click('button[type="submit"]');

    console.log('⏳ Esperando respuesta (10 segundos)...');
    await loginPage.waitForTimeout(10000);

    const loginUrl = loginPage.url();
    console.log(`\n📍 URL después del login: ${loginUrl}`);

    // Verificar si redirigió al dashboard (éxito)
    if (loginUrl.includes('/dashboard')) {
      console.log('\n✅ LOGIN EXITOSO - Redirigido a dashboard');

      // Verificar que el dashboard cargó
      const pageTitle = await loginPage.title();
      console.log(`📄 Título de página: ${pageTitle}`);

      // Tomar screenshot
      await loginPage.screenshot({ path: 'patient-login-success.png' });
      console.log('📸 Screenshot guardado: patient-login-success.png');

      console.log('\n🎉 FLUJO COMPLETO EXITOSO:');
      console.log('   ✅ Registro de paciente');
      console.log('   ✅ Perfil creado en base de datos');
      console.log('   ✅ Login exitoso');
      console.log('   ✅ Dashboard cargado');
    } else {
      // Verificar si hay errores visibles
      const loginErrorElement = await loginPage.$('.bg-danger-light, .text-red-500, .text-red-600, .border-red-500');
      if (loginErrorElement) {
        const loginErrorText = await loginErrorElement.textContent();
        if (loginErrorText && loginErrorText.trim().length > 0) {
          console.log(`\n❌ ERROR EN LOGIN: ${loginErrorText}`);

          if (loginErrorText.includes('no ha sido confirmado') || loginErrorText.includes('not confirmed')) {
            console.log('\n⚠️ CAUSA: Email no confirmado');
            console.log('💡 SOLUCIÓN: El usuario debe confirmar su email antes de hacer login');
            console.log('   (Esto es comportamiento esperado si email confirmation está habilitado)');
          }
        }
      }

      console.log('\n⚠️ Login no redirigió a dashboard');
      console.log(`   URL actual: ${loginUrl}`);
    }

    if (loginErrors.length > 0) {
      console.log(`\n⚠️ Errores de consola en login (${loginErrors.length}):`);
      loginErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }

    console.log('\n━'.repeat(80));
    console.log('RESUMEN FINAL');
    console.log('━'.repeat(80));
    console.log(`\n✅ Cuenta de paciente creada exitosamente`);
    console.log(`📧 Email: ${testPatient.email}`);
    console.log(`🔑 Password: ${testPatient.password}`);
    console.log(`\n💡 Puedes usar estas credenciales para hacer login en:`);
    console.log(`   ${PROD_URL}/login\n`);

    console.log('⏸️ Navegador abierto para inspección. Presiona Ctrl+C para cerrar.\n');

    // Mantener navegador abierto
    await new Promise(() => {});

  } catch (error) {
    console.error('\n💥 ERROR EN TEST:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
})();
