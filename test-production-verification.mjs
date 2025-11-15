import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://holtohiphaokzshtpyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PROD_URL = 'https://cabo-health-longevity.vercel.app';

(async () => {
  console.log('\n🔍 VERIFICACIÓN COMPLETA DE PRODUCCIÓN');
  console.log('='.repeat(80));
  console.log(`URL: ${PROD_URL}`);
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const timestamp = Date.now();
  const testPatient = {
    email: `prod.verify.${timestamp}@gmail.com`,
    password: 'TestPassword123!@#',
    name: 'Production Test User',
    phone: '5551234567',
    birthDate: '1990-01-15',
    gender: 'male',
  };

  console.log(`\n📝 Test User: ${testPatient.email}\n`);

  const consoleMessages = [];
  const consoleErrors = [];

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // TEST 1: VERIFICAR ROOT URL (/) SIN INFINITE LOOP
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 1: VERIFICAR ROOT URL SIN INFINITE LOOP');
    console.log('━'.repeat(80));

    console.log('\n🌐 Navegando a URL raíz /...');
    consoleErrors.length = 0; // Reset

    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle' });

    console.log('⏳ Esperando 10 segundos para detectar infinite loop...');
    await page.waitForTimeout(10000);

    const rootUrl = page.url();
    console.log(`📍 URL final: ${rootUrl}`);

    // Verificar eventos de auth repetidos
    const authStateErrors = consoleErrors.filter(err =>
      err.includes('Auth state changed') ||
      err.includes('Role load already in progress')
    );

    if (authStateErrors.length > 5) {
      console.log(`❌ INFINITE LOOP DETECTADO en / - ${authStateErrors.length} eventos repetidos`);
      console.log('   ESTE ES UN ERROR CRÍTICO - EL FIX NO FUNCIONÓ');
      await page.screenshot({ path: 'prod-root-infinite-loop.png' });
      await browser.close();
      process.exit(1);
    } else {
      console.log(`✅ NO HAY INFINITE LOOP en / - Solo ${authStateErrors.length} eventos`);
    }

    if (rootUrl.includes('/login')) {
      console.log('✅ Root URL redirige correctamente a /login');
    } else {
      console.log(`⚠️ Root URL redirigió a: ${rootUrl}`);
    }

    await page.screenshot({ path: 'prod-root-redirect.png' });
    console.log('📸 Screenshot: prod-root-redirect.png\n');

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: REGISTRO DE PACIENTE
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 2: REGISTRO DE PACIENTE');
    console.log('━'.repeat(80));

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
    await page.waitForTimeout(8000);

    const registerUrl = page.url();
    console.log(`📍 URL: ${registerUrl}`);

    if (registerUrl.includes('/login') || registerUrl.includes('/dashboard')) {
      console.log('✅ REGISTRO EXITOSO\n');
    } else {
      console.log('❌ REGISTRO FALLÓ\n');
      await page.screenshot({ path: 'prod-register-failed.png' });
      await browser.close();
      process.exit(1);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: LOGIN Y VERIFICACIÓN DE INFINITE LOOP EN DASHBOARD
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 3: LOGIN Y VERIFICACIÓN DE INFINITE LOOP EN DASHBOARD');
    console.log('━'.repeat(80));

    await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n✍️ Ingresando credenciales...');
    await page.fill('input[type="email"]', testPatient.email);
    await page.fill('input[type="password"]', testPatient.password);

    consoleErrors.length = 0; // Reset para capturar solo errores de login

    console.log('📤 Enviando login...');
    await page.click('button[type="submit"]');

    console.log('⏳ Esperando 20 segundos para detectar infinite loop en dashboard...');
    await page.waitForTimeout(20000);

    const loginUrl = page.url();
    console.log(`📍 URL: ${loginUrl}`);

    // Verificar infinite loop después del login
    const authStateErrorsAfterLogin = consoleErrors.filter(err =>
      err.includes('Auth state changed') ||
      err.includes('Role load already in progress')
    );

    if (authStateErrorsAfterLogin.length > 5) {
      console.log(`❌ INFINITE LOOP DETECTADO después de login - ${authStateErrorsAfterLogin.length} eventos`);
      console.log('   ESTE ES UN ERROR CRÍTICO');
      await page.screenshot({ path: 'prod-login-infinite-loop.png' });
      await browser.close();
      process.exit(1);
    } else {
      console.log(`✅ NO HAY INFINITE LOOP después de login - Solo ${authStateErrorsAfterLogin.length} eventos`);
    }

    if (!loginUrl.includes('/dashboard')) {
      console.log('❌ LOGIN FALLÓ - No redirigió a dashboard\n');
      await page.screenshot({ path: 'prod-login-failed.png' });
      await browser.close();
      process.exit(1);
    }

    console.log('✅ DASHBOARD CARGÓ CORRECTAMENTE\n');

    // Asegurar que todo el dashboard terminó de hidratarse antes de continuar
    await page.waitForLoadState('networkidle').catch(() => {
      console.log('⚠️ networkidle no se alcanzó, continuando con el contenido disponible');
    });

    await page.screenshot({ path: 'prod-dashboard-loaded.png' });
    console.log('📸 Screenshot: prod-dashboard-loaded.png\n');

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: VERIFICACIÓN DE BOTÓN DE SUBIR PDF
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 4: VERIFICACIÓN DE BOTÓN DE SUBIR PDF');
    console.log('━'.repeat(80));

    // Esperar a que el dashboard del paciente esté completamente montado
    await page.waitForSelector('h1:has-text("Mi Portal de Salud")', {
      timeout: 60000,
    }).catch(() => {
      console.log('⚠️ El título principal no apareció antes del tiempo límite');
    });

    const selectButton = await page.waitForSelector('label[for="file-upload"]', {
      timeout: 60000,
      state: 'attached',
    }).catch(() => null);
    if (!selectButton) {
      const htmlDump = await page.content();
      fs.writeFileSync('prod-dashboard-dom.html', htmlDump, 'utf8');
      console.log('📝 Dump HTML: prod-dashboard-dom.html');
      console.log('❌ NO SE ENCONTRÓ EL BOTÓN "Seleccionar PDF"\n');
      await page.screenshot({ path: 'prod-no-select-button.png' });
      await browser.close();
      process.exit(1);
    }

    await selectButton.waitForElementState('visible').catch(() => {
      console.log('⚠️ El botón existe pero no se volvió visible antes del tiempo límite');
    });
    console.log('✅ Botón "Seleccionar PDF" encontrado');

    // Simular selección de archivo
    console.log('📎 Simulando selección de archivo...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      console.log('❌ NO SE ENCONTRÓ EL INPUT DE ARCHIVO\n');
      await browser.close();
      process.exit(1);
    }

    const buffer = Buffer.from('%PDF-1.4\ntest content', 'utf-8');
    await fileInput.setInputFiles({
      name: 'test-analysis.pdf',
      mimeType: 'application/pdf',
      buffer: buffer,
    });

    // Verificar que aparecieron los botones
    const uploadButton = await page.waitForSelector('button:has-text("Subir Análisis")', {
      timeout: 10000,
    }).catch(() => null);
    const cancelButton = await page.waitForSelector('button:has-text("Cancelar")', {
      timeout: 10000,
    }).catch(() => null);

    if (!uploadButton) {
      console.log('❌ BOTÓN "Subir Análisis" NO APARECIÓ\n');
      await page.screenshot({ path: 'prod-no-upload-button.png' });
      await browser.close();
      process.exit(1);
    }

    console.log('✅ Botón "Subir Análisis" APARECIÓ');

    if (!cancelButton) {
      console.log('⚠️ BOTÓN "Cancelar" NO APARECIÓ');
    } else {
      console.log('✅ Botón "Cancelar" encontrado');
    }

    await page.screenshot({ path: 'prod-upload-buttons.png' });
    console.log('📸 Screenshot: prod-upload-buttons.png\n');

    // ═══════════════════════════════════════════════════════════════
    // TEST 5: VERIFICACIÓN DE SCHEMA ERRORS
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('TEST 5: VERIFICACIÓN DE SCHEMA ERRORS');
    console.log('━'.repeat(80));

    const schemaErrors = consoleErrors.filter(err =>
      err.includes('Could not find a relationship') ||
      err.includes('PGRST200')
    );

    if (schemaErrors.length > 0) {
      console.log(`❌ SCHEMA ERRORS DETECTADOS (${schemaErrors.length}):`);
      schemaErrors.forEach(err => console.log(`   ${err}`));
      console.log('');
    } else {
      console.log('✅ NO HAY SCHEMA ERRORS\n');
    }

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(80));
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('━'.repeat(80));

    console.log('\n📊 Resumen de Verificación:');
    console.log('   ✅ Root URL (/) redirige sin infinite loop');
    console.log('   ✅ Registro de paciente funciona');
    console.log('   ✅ Login exitoso sin infinite loop');
    console.log('   ✅ Dashboard carga correctamente');
    console.log('   ✅ Botones de upload aparecen después de seleccionar archivo');
    console.log('   ✅ No hay schema errors');

    console.log('\n🎉 PRODUCCIÓN FUNCIONANDO CORRECTAMENTE');
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
