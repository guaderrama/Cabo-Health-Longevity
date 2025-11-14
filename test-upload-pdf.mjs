import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const PROD_URL = 'https://cabo-health-longevity.vercel.app';

// Credenciales del paciente que creamos anteriormente
const PATIENT_EMAIL = 'patient.test.1763069669456@gmail.com';
const PATIENT_PASSWORD = 'PatientPassword123!@#';

(async () => {
  console.log('\n🧪 TEST: SUBIR PDF EN PORTAL DE PACIENTE');
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capturar errores de consola
    const consoleErrors = [];
    const consoleWarnings = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Capturar errores de página
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
    });

    // PASO 1: LOGIN
    console.log('\n━'.repeat(80));
    console.log('PASO 1: LOGIN COMO PACIENTE');
    console.log('━'.repeat(80));

    console.log(`\n🌐 Navegando a /login...`);
    await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✍️ Ingresando credenciales...');
    await page.fill('input[type="email"]', PATIENT_EMAIL);
    await page.fill('input[type="password"]', PATIENT_PASSWORD);

    console.log('📤 Enviando login...');
    await page.click('button[type="submit"]');

    console.log('⏳ Esperando redirección...');
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);

    if (!currentUrl.includes('/dashboard')) {
      console.log('❌ ERROR: No se redirigió al dashboard');
      console.log('   Por favor verifica las credenciales o el estado de la sesión');
      await browser.close();
      process.exit(1);
    }

    console.log('✅ Login exitoso - En dashboard de paciente');

    // PASO 2: INSPECCIONAR ELEMENTOS DE SUBIDA DE PDF
    console.log('\n━'.repeat(80));
    console.log('PASO 2: INSPECCIONAR INTERFAZ DE SUBIDA');
    console.log('━'.repeat(80));

    // Esperar a que la página cargue completamente
    await page.waitForTimeout(3000);

    // Verificar si existe el input de archivo
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      console.log('✅ Input de archivo encontrado');

      // Verificar atributos del input
      const accept = await fileInput.getAttribute('accept');
      const id = await fileInput.getAttribute('id');
      console.log(`   - Accept: ${accept}`);
      console.log(`   - ID: ${id}`);
    } else {
      console.log('❌ Input de archivo NO encontrado');
    }

    // Verificar si existe el botón de seleccionar
    const selectButton = await page.$('label[for="file-upload"]');
    if (selectButton) {
      console.log('✅ Botón "Seleccionar PDF" encontrado');
    } else {
      console.log('❌ Botón "Seleccionar PDF" NO encontrado');
    }

    // Tomar screenshot del estado inicial
    await page.screenshot({ path: 'dashboard-before-upload.png' });
    console.log('📸 Screenshot guardado: dashboard-before-upload.png');

    // PASO 3: CREAR UN PDF DE PRUEBA
    console.log('\n━'.repeat(80));
    console.log('PASO 3: CREAR Y SELECCIONAR PDF DE PRUEBA');
    console.log('━'.repeat(80));

    // Crear un PDF simple de prueba usando HTML
    const testPdfPath = path.join(process.cwd(), 'test-analisis.pdf');

    // En lugar de crear un PDF real, vamos a usar un archivo existente si existe
    // o simular la selección
    console.log('🔍 Buscando archivo PDF de prueba...');

    if (!fs.existsSync(testPdfPath)) {
      console.log('⚠️ No hay archivo PDF de prueba');
      console.log('💡 Por favor, crea un archivo llamado "test-analisis.pdf" en la raíz del proyecto');
      console.log('   O selecciona manualmente un PDF en el navegador que se mantiene abierto');
    } else {
      console.log('✅ Archivo PDF de prueba encontrado');

      // Seleccionar el archivo
      console.log('\n📎 Seleccionando archivo PDF...');
      await fileInput.setInputFiles(testPdfPath);
      await page.waitForTimeout(1000);

      // Verificar si apareció el botón de subir
      const uploadButton = await page.$('button:has-text("Subir Análisis")');
      if (uploadButton) {
        console.log('✅ Botón "Subir Análisis" APARECIÓ');

        // Verificar si está deshabilitado
        const isDisabled = await uploadButton.isDisabled();
        console.log(`   - Estado: ${isDisabled ? 'Deshabilitado' : 'Habilitado'}`);

        // Tomar screenshot
        await page.screenshot({ path: 'dashboard-file-selected.png' });
        console.log('📸 Screenshot guardado: dashboard-file-selected.png');

        // Intentar hacer clic
        console.log('\n🖱️ Haciendo clic en "Subir Análisis"...');
        await uploadButton.click();

        console.log('⏳ Esperando respuesta (15 segundos)...');
        await page.waitForTimeout(15000);

        // Verificar errores o éxito
        const errorElement = await page.$('.bg-danger-light, .text-red-500, .text-red-600');
        const successElement = await page.$('.bg-green-50, .text-green-600');

        if (errorElement) {
          const errorText = await errorElement.textContent();
          console.log(`\n❌ ERROR AL SUBIR: ${errorText}`);
        } else if (successElement) {
          const successText = await successElement.textContent();
          console.log(`\n✅ ÉXITO: ${successText}`);
        } else {
          console.log('\n⚠️ No se detectó mensaje de error ni éxito');
        }

        // Tomar screenshot del resultado
        await page.screenshot({ path: 'dashboard-after-upload.png' });
        console.log('📸 Screenshot guardado: dashboard-after-upload.png');

      } else {
        console.log('❌ Botón "Subir Análisis" NO APARECIÓ después de seleccionar archivo');
        console.log('   Esto indica un problema en el código React');

        // Verificar el estado del selectedFile en React
        const fileName = await page.$eval('input[type="file"]', el => el.files[0]?.name);
        console.log(`   Archivo en input: ${fileName || 'NINGUNO'}`);

        await page.screenshot({ path: 'dashboard-button-missing.png' });
        console.log('📸 Screenshot guardado: dashboard-button-missing.png');
      }
    }

    // PASO 4: RESUMEN DE ERRORES
    console.log('\n━'.repeat(80));
    console.log('RESUMEN DE ERRORES DE CONSOLA');
    console.log('━'.repeat(80));

    if (consoleErrors.length > 0) {
      console.log(`\n❌ Se encontraron ${consoleErrors.length} errores de consola:`);
      consoleErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ No se encontraron errores de consola');
    }

    console.log('\n⏸️ Navegador abierto para inspección manual.');
    console.log('   Presiona Ctrl+C para cerrar.\n');

    // Mantener el navegador abierto
    await new Promise(() => {});

  } catch (error) {
    console.error('\n💥 ERROR EN TEST:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
})();
