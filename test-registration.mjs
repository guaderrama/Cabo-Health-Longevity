import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Iniciando test de registro...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar todos los mensajes de consola
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, text);
    consoleMessages.push({ type: msg.type(), text });
  });

  // Capturar errores
  page.on('pageerror', error => {
    console.error('❌ [PAGE ERROR]:', error.message);
  });

  try {
    // Ir a la página de registro
    console.log('📍 Navegando a /register...');
    await page.goto('https://cabo-health-longevity.vercel.app/register', {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(2000);

    // Generar email único para esta prueba
    const timestamp = Date.now();
    const testEmail = `test.patient.${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!@#';

    console.log(`\n📝 Datos de prueba:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: Paciente\n`);

    // Seleccionar rol de paciente
    console.log('👤 Seleccionando rol: Paciente...');
    await page.click('button:has-text("Paciente")');
    await page.waitForTimeout(500);

    // Llenar formulario
    console.log('✍️ Llenando formulario...');

    // Nombre
    await page.fill('input[name="name"]', 'Test Patient');
    await page.waitForTimeout(200);

    // Email
    await page.fill('input[type="email"]', testEmail);
    await page.waitForTimeout(200);

    // Password
    await page.fill('input[type="password"]', testPassword);
    await page.waitForTimeout(200);

    // Teléfono
    await page.fill('input[name="phone"]', '1234567890');
    await page.waitForTimeout(200);

    // Fecha de nacimiento
    await page.fill('input[type="date"]', '1990-01-01');
    await page.waitForTimeout(500);

    console.log('✅ Formulario llenado\n');
    console.log('🔄 Enviando formulario...\n');

    // Limpiar mensajes previos
    consoleMessages.length = 0;

    // Submit
    await page.click('button[type="submit"]');

    // Esperar y observar
    console.log('⏳ Esperando respuesta (15 segundos)...\n');
    await page.waitForTimeout(15000);

    // Verificar URL actual
    const currentUrl = page.url();
    console.log(`\n📍 URL actual: ${currentUrl}`);

    // Mostrar resumen de mensajes de consola capturados
    console.log(`\n📊 RESUMEN DE CONSOLA (${consoleMessages.length} mensajes):`);
    console.log('='.repeat(80));

    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    const logs = consoleMessages.filter(m => m.type === 'log');

    if (errors.length > 0) {
      console.log(`\n❌ ERRORES (${errors.length}):`);
      errors.forEach((msg, i) => {
        console.log(`\n${i + 1}. ${msg.text}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${warnings.length}):`);
      warnings.forEach((msg, i) => {
        console.log(`${i + 1}. ${msg.text}`);
      });
    }

    console.log(`\n📝 LOGS (${logs.length}):`);
    logs.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.text}`);
    });

    console.log('\n' + '='.repeat(80));

    // Verificar elementos visibles en la página
    const errorElement = await page.$('.text-red-500, .text-red-600, .text-red-800');
    const successElement = await page.$('.text-green-500, .text-green-600, .text-green-800, .bg-green-50');

    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log(`\n❌ ERROR VISIBLE EN UI: ${errorText}`);
    }

    if (successElement) {
      const successText = await successElement.textContent();
      console.log(`\n✅ MENSAJE DE ÉXITO EN UI: ${successText}`);
    }

    // Mantener navegador abierto para inspección manual
    console.log('\n⏸️ Navegador abierto para inspección manual.');
    console.log('Presiona Ctrl+C cuando termines de revisar.\n');

    // Esperar indefinidamente
    await new Promise(() => {});

  } catch (error) {
    console.error('\n💥 ERROR EN TEST:', error.message);
    console.error(error.stack);
  } finally {
    // No cerrar para permitir inspección
    // await browser.close();
  }
})();
