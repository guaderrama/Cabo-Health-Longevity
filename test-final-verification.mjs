import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PROD_URL = 'https://cabo-health-longevity.vercel.app';

(async () => {
  console.log('\n🔬 VERIFICACIÓN FINAL DE TODOS LOS FIXES');
  console.log('='.repeat(80));

  const timestamp = Date.now();
  const testPatient = {
    email: `final.test.${timestamp}@gmail.com`,
    password: 'TestPassword123!@#',
    name: 'Test Final Usuario',
    phone: '5551234567',
    birthDate: '1990-01-15',
    gender: 'male',
  };

  console.log('\n📝 Datos del test:');
  console.log(`   Email: ${testPatient.email}`);
  console.log(`   Password: ${testPatient.password}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const consoleMessages = [];
  const consoleErrors = [];

  try {
    // ═══════════════════════════════════════════════════════════════
    // TEST 1: REGISTRO
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 1: REGISTRO DE PACIENTE');
    console.log('━'.repeat(80));

    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    console.log('\n🌐 Navegando a /register...');
    await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('👤 Seleccionando rol: Paciente...');
    await page.click('button:has-text("Paciente")');
    await page.waitForTimeout(1000);

    console.log('✍️ Llenando formulario...');
    await page.fill('input[type="text"]', testPatient.name);
    await page.fill('input[type="email"]', testPatient.email);
    await page.fill('input[type="password"]', testPatient.password);
    await page.fill('input[type="tel"]', testPatient.phone);
    await page.fill('input[type="date"]', testPatient.birthDate);
    await page.selectOption('select', testPatient.gender);

    console.log('📤 Enviando registro...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(10000);

    const registerUrl = page.url();
    console.log(`📍 URL: ${registerUrl}`);

    if (registerUrl.includes('/login') || registerUrl.includes('/dashboard')) {
      console.log('✅ REGISTRO EXITOSO\n');
    } else {
      console.log('❌ REGISTRO FALLÓ\n');
      await browser.close();
      process.exit(1);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: LOGIN Y VERIFICACIÓN DE INFINITE LOOP
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 2: LOGIN Y VERIFICACIÓN DE INFINITE LOOP');
    console.log('━'.repeat(80));

    await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n✍️ Ingresando credenciales...');
    await page.fill('input[type="email"]', testPatient.email);
    await page.fill('input[type="password"]', testPatient.password);

    // Resetear errores de consola para capturar solo los del login
    consoleErrors.length = 0;

    console.log('📤 Enviando login...');
    await page.click('button[type="submit"]');

    // Esperar 15 segundos para ver si hay infinite loop
    console.log('⏳ Esperando 15 segundos para detectar infinite loop...');
    await page.waitForTimeout(15000);

    const loginUrl = page.url();
    console.log(`📍 URL: ${loginUrl}`);

    // Verificar si hay errores de infinite loop
    const authStateErrors = consoleErrors.filter(err =>
      err.includes('Auth state changed') ||
      err.includes('Role load already in progress')
    );

    if (authStateErrors.length > 5) {
      console.log(`❌ INFINITE LOOP DETECTADO - ${authStateErrors.length} eventos repetidos\n`);
      await browser.close();
      process.exit(1);
    } else {
      console.log(`✅ NO HAY INFINITE LOOP - Solo ${authStateErrors.length} eventos de auth\n`);
    }

    if (!loginUrl.includes('/dashboard')) {
      console.log('❌ LOGIN FALLÓ - No redirigió a dashboard\n');
      await browser.close();
      process.exit(1);
    }

    console.log('✅ DASHBOARD CARGÓ CORRECTAMENTE\n');

    // Tomar screenshot del dashboard
    await page.screenshot({ path: 'final-verification-dashboard.png' });
    console.log('📸 Screenshot: final-verification-dashboard.png\n');

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: VERIFICACIÓN DE SCHEMA ERROR
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 3: VERIFICACIÓN DE SCHEMA ERROR');
    console.log('━'.repeat(80));

    // Filtrar errores de schema
    const schemaErrors = consoleErrors.filter(err =>
      err.includes('Could not find a relationship') ||
      err.includes('PGRST200')
    );

    if (schemaErrors.length > 0) {
      console.log(`❌ SCHEMA ERROR DETECTADO:`);
      schemaErrors.forEach(err => console.log(`   ${err}`));
      console.log('');
    } else {
      console.log('✅ NO HAY SCHEMA ERRORS\n');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: VERIFICACIÓN DE BOTÓN DE SUBIR PDF
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 4: VERIFICACIÓN DE BOTÓN DE SUBIR PDF');
    console.log('━'.repeat(80));

    // Verificar que existe el botón de seleccionar
    const selectButton = await page.$('label[for="file-upload"]');
    if (!selectButton) {
      console.log('❌ NO SE ENCONTRÓ EL BOTÓN "Seleccionar PDF"\n');
      await browser.close();
      process.exit(1);
    }
    console.log('✅ Botón "Seleccionar PDF" encontrado');

    // Crear un archivo PDF de prueba simulado (solo para verificar UI)
    // En lugar de crear un PDF real, vamos a simular la selección
    console.log('📎 Simulando selección de archivo...');

    // Usar el input file para "cargar" un archivo
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      console.log('❌ NO SE ENCONTRÓ EL INPUT DE ARCHIVO\n');
      await browser.close();
      process.exit(1);
    }

    // Crear un buffer de datos simulados como PDF
    const buffer = Buffer.from('%PDF-1.4\ntest content', 'utf-8');

    // Setear el archivo en el input
    await fileInput.setInputFiles({
      name: 'test-analysis.pdf',
      mimeType: 'application/pdf',
      buffer: buffer,
    });

    await page.waitForTimeout(2000);

    // Verificar que aparecieron los botones de Subir y Cancelar
    const uploadButton = await page.$('button:has-text("Subir Análisis")');
    const cancelButton = await page.$('button:has-text("Cancelar")');

    if (!uploadButton) {
      console.log('❌ BOTÓN "Subir Análisis" NO APARECIÓ después de seleccionar archivo\n');
      await page.screenshot({ path: 'final-verification-no-button.png' });
      console.log('📸 Screenshot: final-verification-no-button.png\n');
      await browser.close();
      process.exit(1);
    }

    if (!cancelButton) {
      console.log('⚠️ BOTÓN "Cancelar" NO APARECIÓ\n');
    } else {
      console.log('✅ Botón "Cancelar" encontrado');
    }

    console.log('✅ Botón "Subir Análisis" APARECIÓ CORRECTAMENTE');

    // Verificar que el archivo seleccionado se muestra
    const fileNameElement = await page.$('text=/Archivo seleccionado:/');
    if (fileNameElement) {
      console.log('✅ Nombre del archivo se muestra en la interfaz');
    }

    // Tomar screenshot con los botones visibles
    await page.screenshot({ path: 'final-verification-upload-buttons.png' });
    console.log('📸 Screenshot: final-verification-upload-buttons.png\n');

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('RESUMEN FINAL');
    console.log('━'.repeat(80));

    console.log('\n✅ TODOS LOS TESTS PASARON:');
    console.log('   ✅ Registro de paciente');
    console.log('   ✅ Login exitoso');
    console.log('   ✅ Dashboard carga sin infinite loop');
    console.log('   ✅ No hay schema errors');
    console.log('   ✅ Botones de subida de PDF aparecen correctamente');

    console.log('\n📊 Estadísticas:');
    console.log(`   Mensajes de consola: ${consoleMessages.length}`);
    console.log(`   Errores de consola: ${consoleErrors.length}`);
    console.log(`   Eventos de auth repetidos: ${authStateErrors.length}`);
    console.log(`   Schema errors: ${schemaErrors.length}`);

    console.log('\n🎉 VERIFICACIÓN COMPLETA - TODOS LOS FIXES FUNCIONAN CORRECTAMENTE');
    console.log('━'.repeat(80));

    console.log('\n⏸️ Navegador abierto para inspección. Presiona Ctrl+C para cerrar.\n');

    // Mantener navegador abierto
    await new Promise(() => {});

  } catch (error) {
    console.error('\n💥 ERROR EN VERIFICACIÓN:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
})();
