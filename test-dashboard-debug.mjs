import { chromium } from 'playwright';

const PROD_URL = 'https://cabo-health-longevity.vercel.app';

// Usar credenciales existentes del test anterior
const TEST_EMAIL = 'prod.verify.1763153086684@gmail.com';
const TEST_PASSWORD = 'TestPassword123!@#';

(async () => {
  console.log('\n🐛 DEBUG: DASHBOARD LOADING ISSUE');
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  const consoleErrors = [];
  const networkErrors = [];

  // Capturar TODOS los mensajes de consola
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    consoleMessages.push({ type, text });

    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);

    if (type === 'error') {
      consoleErrors.push(text);
    }
  });

  // Capturar errores de red
  page.on('requestfailed', request => {
    const error = `${request.url()} - ${request.failure().errorText}`;
    networkErrors.push(error);
    console.log(`[NETWORK ERROR] ${error}`);
  });

  // Capturar errores de página
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    consoleErrors.push(error.message);
  });

  try {
    console.log('\n1. Navegando a login...');
    await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n2. Haciendo login...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    console.log('\n3. Esperando dashboard (30 segundos)...');
    await page.waitForTimeout(30000);

    const url = page.url();
    console.log(`\n📍 URL: ${url}`);

    // Intentar obtener el HTML del dashboard
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    console.log('\n📄 CONTENIDO DEL DASHBOARD:');
    console.log(bodyHTML.substring(0, 500));

    // Verificar si hay elementos específicos
    const hasTitle = await page.$('h1');
    const hasUploadSection = await page.$('label[for="file-upload"]');
    const hasSpinner = await page.$('.animate-spin');

    console.log('\n🔍 ELEMENTOS ENCONTRADOS:');
    console.log(`  - Título h1: ${hasTitle ? 'SÍ' : 'NO'}`);
    console.log(`  - Sección de upload: ${hasUploadSection ? 'SÍ' : 'NO'}`);
    console.log(`  - Spinner de carga: ${hasSpinner ? 'SÍ' : 'NO'}`);

    // Tomar screenshot
    await page.screenshot({ path: 'dashboard-debug.png', fullPage: true });
    console.log('\n📸 Screenshot: dashboard-debug.png');

    console.log('\n━'.repeat(80));
    console.log('RESUMEN DE ERRORES:');
    console.log('━'.repeat(80));

    if (consoleErrors.length > 0) {
      console.log(`\n❌ ERRORES DE CONSOLA (${consoleErrors.length}):`);
      consoleErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ No hay errores de consola');
    }

    if (networkErrors.length > 0) {
      console.log(`\n❌ ERRORES DE RED (${networkErrors.length}):`);
      networkErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ No hay errores de red');
    }

    console.log('\n⏸️ Navegador abierto para inspección. Presiona Ctrl+C para cerrar.\n');

    // Mantener navegador abierto
    await new Promise(() => {});

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
})();
