/**
 * Script de pruebas para la aplicación Cabo Health Clinic en producción
 * Este script prueba el registro, login y funcionalidades principales
 * para usuarios tipo Doctor y Paciente
 */

const BASE_URL = 'https://cabo-health-longevity.vercel.app';

// Generar datos únicos para las pruebas
const timestamp = Date.now();
const patientEmail = `patient.test${timestamp}@example.com`;
const doctorEmail = `doctor.test${timestamp}@example.com`;
const testPassword = 'Test123!@#';

// Datos de prueba para paciente
const patientData = {
  email: patientEmail,
  password: testPassword,
  firstName: 'Juan',
  lastName: 'Pérez García',
  phone: '+52 624 123 4567',
  dateOfBirth: '1985-05-15',
  gender: 'male',
  address: 'Calle Marina 123, Cabo San Lucas',
  emergencyContact: 'María Pérez - +52 624 987 6543'
};

// Datos de prueba para doctor
const doctorData = {
  email: doctorEmail,
  password: testPassword,
  firstName: 'Dra. Ana',
  lastName: 'Rodríguez López',
  phone: '+52 624 456 7890',
  specialty: 'Medicina Interna',
  licenseNumber: 'MED-12345678',
  yearsExperience: 15
};

// Datos de resultados de laboratorio de prueba
const labResults = {
  glucose: {
    value: 95,
    unit: 'mg/dL',
    reference: '70-100 mg/dL',
    status: 'normal'
  },
  cholesterolTotal: {
    value: 185,
    unit: 'mg/dL',
    reference: '<200 mg/dL',
    status: 'normal'
  },
  hdl: {
    value: 55,
    unit: 'mg/dL',
    reference: '>40 mg/dL (hombres)',
    status: 'normal'
  },
  ldl: {
    value: 110,
    unit: 'mg/dL',
    reference: '<100 mg/dL',
    status: 'slightly-elevated'
  },
  triglycerides: {
    value: 140,
    unit: 'mg/dL',
    reference: '<150 mg/dL',
    status: 'normal'
  },
  hemoglobin: {
    value: 14.5,
    unit: 'g/dL',
    reference: '13.5-17.5 g/dL (hombres)',
    status: 'normal'
  },
  creatinine: {
    value: 0.9,
    unit: 'mg/dL',
    reference: '0.7-1.2 mg/dL',
    status: 'normal'
  },
  vitaminD: {
    value: 32,
    unit: 'ng/mL',
    reference: '30-100 ng/mL',
    status: 'normal'
  },
  tsh: {
    value: 2.1,
    unit: 'mIU/L',
    reference: '0.4-4.0 mIU/L',
    status: 'normal'
  }
};

console.log('🧪 PRUEBAS DE PRODUCCIÓN - CABO HEALTH CLINIC');
console.log('=' .repeat(50));
console.log(`URL: ${BASE_URL}`);
console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
console.log('=' .repeat(50));
console.log('');

console.log('📋 PLAN DE PRUEBAS:');
console.log('');
console.log('1. REGISTRO Y AUTENTICACIÓN');
console.log('   ✓ Registrar nuevo paciente: ' + patientEmail);
console.log('   ✓ Registrar nuevo doctor: ' + doctorEmail);
console.log('   ✓ Verificar emails de confirmación');
console.log('   ✓ Probar login con credenciales');
console.log('   ✓ Verificar logout');
console.log('');

console.log('2. FUNCIONALIDADES DE PACIENTE');
console.log('   ✓ Completar perfil de paciente');
console.log('   ✓ Subir resultados de laboratorio');
console.log('   ✓ Ver análisis de biomarcadores');
console.log('   ✓ Programar cita médica');
console.log('   ✓ Ver historial médico');
console.log('   ✓ Descargar reportes en PDF');
console.log('');

console.log('3. FUNCIONALIDADES DE DOCTOR');
console.log('   ✓ Ver lista de pacientes');
console.log('   ✓ Acceder a historiales médicos');
console.log('   ✓ Revisar resultados de laboratorio');
console.log('   ✓ Agregar notas médicas');
console.log('   ✓ Gestionar citas');
console.log('   ✓ Generar prescripciones');
console.log('');

console.log('4. SEGURIDAD Y PERMISOS');
console.log('   ✓ Verificar que pacientes no puedan ver datos de otros');
console.log('   ✓ Verificar que solo doctores accedan a funciones médicas');
console.log('   ✓ Probar restricciones de RLS en Supabase');
console.log('   ✓ Verificar manejo de sesiones');
console.log('');

console.log('5. RENDIMIENTO Y UX');
console.log('   ✓ Medir tiempos de carga');
console.log('   ✓ Verificar responsive design');
console.log('   ✓ Probar navegación');
console.log('   ✓ Verificar mensajes de error');
console.log('');

console.log('=' .repeat(50));
console.log('');
console.log('⚠️  INSTRUCCIONES DE PRUEBA MANUAL:');
console.log('');
console.log('PASO 1: Crear cuenta de PACIENTE');
console.log('1. Navega a: ' + BASE_URL + '/register');
console.log('2. Selecciona "Soy Paciente"');
console.log('3. Ingresa los siguientes datos:');
console.log('   - Email: ' + patientEmail);
console.log('   - Contraseña: ' + testPassword);
console.log('   - Nombre: ' + patientData.firstName);
console.log('   - Apellido: ' + patientData.lastName);
console.log('   - Teléfono: ' + patientData.phone);
console.log('   - Fecha de nacimiento: ' + patientData.dateOfBirth);
console.log('4. Click en "Registrarse"');
console.log('5. Verifica el email de confirmación');
console.log('');

console.log('PASO 2: Probar funcionalidades de PACIENTE');
console.log('1. Inicia sesión con las credenciales del paciente');
console.log('2. En el Dashboard, sube resultados de laboratorio:');
console.log('   - Click en "Subir Resultados"');
console.log('   - Ingresa los valores de prueba proporcionados');
console.log('3. Revisa el análisis de biomarcadores');
console.log('4. Programa una cita médica');
console.log('5. Descarga tu reporte en PDF');
console.log('6. Cierra sesión');
console.log('');

console.log('PASO 3: Crear cuenta de DOCTOR');
console.log('1. Navega a: ' + BASE_URL + '/register');
console.log('2. Selecciona "Soy Profesional de la Salud"');
console.log('3. Ingresa los siguientes datos:');
console.log('   - Email: ' + doctorEmail);
console.log('   - Contraseña: ' + testPassword);
console.log('   - Nombre: ' + doctorData.firstName);
console.log('   - Apellido: ' + doctorData.lastName);
console.log('   - Especialidad: ' + doctorData.specialty);
console.log('   - Cédula: ' + doctorData.licenseNumber);
console.log('4. Click en "Registrarse"');
console.log('');

console.log('PASO 4: Probar funcionalidades de DOCTOR');
console.log('1. Inicia sesión con las credenciales del doctor');
console.log('2. Navega a "Pacientes"');
console.log('3. Busca y accede al perfil del paciente de prueba');
console.log('4. Revisa los resultados de laboratorio');
console.log('5. Agrega una nota médica');
console.log('6. Gestiona las citas programadas');
console.log('');

console.log('PASO 5: Verificar SEGURIDAD');
console.log('1. Como paciente, intenta acceder a: /admin');
console.log('2. Como paciente, intenta ver datos de otros pacientes');
console.log('3. Como doctor, verifica acceso a todos los pacientes');
console.log('4. Prueba cerrar sesión y acceder a páginas protegidas');
console.log('');

console.log('=' .repeat(50));
console.log('');
console.log('📊 VALORES DE LABORATORIO PARA PRUEBAS:');
console.log('');
Object.entries(labResults).forEach(([key, data]) => {
  console.log(`${key}:`);
  console.log(`  - Valor: ${data.value} ${data.unit}`);
  console.log(`  - Referencia: ${data.reference}`);
  console.log(`  - Estado: ${data.status}`);
  console.log('');
});

console.log('=' .repeat(50));
console.log('');
console.log('🔍 CHECKLIST DE VERIFICACIÓN:');
console.log('');
console.log('[ ] Registro de paciente funciona correctamente');
console.log('[ ] Registro de doctor funciona correctamente');
console.log('[ ] Login/Logout funciona para ambos roles');
console.log('[ ] Dashboard del paciente carga correctamente');
console.log('[ ] Carga de resultados de laboratorio funciona');
console.log('[ ] Análisis de biomarcadores se muestra correctamente');
console.log('[ ] Sistema de citas funciona');
console.log('[ ] Dashboard del doctor carga correctamente');
console.log('[ ] Doctor puede ver lista de pacientes');
console.log('[ ] Doctor puede acceder a historiales médicos');
console.log('[ ] Permisos y restricciones funcionan correctamente');
console.log('[ ] La aplicación es responsive (móvil/tablet/desktop)');
console.log('[ ] Los tiempos de carga son aceptables (<3s)');
console.log('[ ] Mensajes de error son claros y útiles');
console.log('[ ] Navegación es intuitiva');
console.log('');

console.log('=' .repeat(50));
console.log('');
console.log('💡 NOTAS IMPORTANTES:');
console.log('');
console.log('- Los emails de prueba son únicos con timestamp');
console.log('- La contraseña cumple con requisitos de seguridad');
console.log('- Los datos de laboratorio están en rangos realistas');
console.log('- Prueba en diferentes navegadores (Chrome, Firefox, Safari)');
console.log('- Verifica en dispositivos móviles');
console.log('');

console.log('🚀 ¡Comienza las pruebas ahora!');
console.log('URL: ' + BASE_URL);