# 🧪 Guía de Pruebas Manuales - Fixes de Autenticación

## ✅ Fixes Implementados (Ya en Producción)

### 1. Password Validation (Issue #4)
- ✅ minLength cambiado de 6 a 12 caracteres
- ✅ Validación en tiempo real
- ✅ Indicador visual de fortaleza
- ✅ Checklist de requisitos con íconos

### 2. Email Validation (Issue #5)
- ✅ Validación en tiempo real en Register y Login
- ✅ Feedback visual (borde rojo + mensaje de error)
- ✅ Validación antes de enviar formulario

### 3. ErrorBoundary Security (Issue #6)
- ✅ Stack traces ocultos en producción
- ✅ Mensajes amigables en español
- ✅ UI profesional con opciones de recuperación

---

## 🔍 Plan de Pruebas Detallado

### **PRUEBA 1: Registro de Paciente**

**URL:** https://cabo-health-longevity.vercel.app/register

#### Paso 1: Probar Validación de Email
1. Click en "Soy Paciente"
2. En el campo "Correo Electrónico", escribir: `test@invalid`
3. ✅ **Esperado:** Borde rojo + mensaje "Por favor ingrese un correo electrónico válido"
4. Corregir a: `paciente.test@example.com`
5. ✅ **Esperado:** Borde verde, sin mensaje de error

#### Paso 2: Probar Validación de Contraseña (Contraseña Débil)
1. Click en campo "Contraseña"
2. ✅ **Esperado:** Aparece checklist de requisitos
3. Escribir: `test123`
4. ✅ **Esperado:**
   - Barra roja (Débil)
   - X roja en "Mínimo 12 caracteres"
   - X roja en "Una letra mayúscula"
   - X roja en "Un carácter especial"
5. Intentar enviar formulario
6. ✅ **Esperado:** Error "Contraseña inválida: ..."

#### Paso 3: Probar Contraseña Media
1. En campo "Contraseña", escribir: `TestPaciente1`
2. ✅ **Esperado:**
   - Barra amarilla/azul (Media/Fuerte)
   - Checks verdes en requisitos cumplidos
   - X en "Un carácter especial"

#### Paso 4: Probar Contraseña Muy Fuerte
1. En campo "Contraseña", escribir: `TestPaciente123!@#`
2. ✅ **Esperado:**
   - Barra verde completa
   - Etiqueta "Muy Fuerte" en verde
   - Todos los checks verdes ✓
     - ✓ Mínimo 12 caracteres
     - ✓ Una letra mayúscula
     - ✓ Una letra minúscula
     - ✓ Un número
     - ✓ Un carácter especial

#### Paso 5: Completar Registro
1. Llenar todos los campos:
   - **Nombre:** Juan Pérez García
   - **Email:** paciente.test@example.com
   - **Contraseña:** TestPaciente123!@#
   - **Fecha de Nacimiento:** 15/05/1985
   - **Género:** Masculino
2. Click "Crear Cuenta"
3. ✅ **Esperado:**
   - Cuenta creada exitosamente
   - Redirección a dashboard
   - (Posiblemente recibir email de confirmación de Supabase)

---

### **PRUEBA 2: Registro de Doctor**

**URL:** https://cabo-health-longevity.vercel.app/register

#### Paso 1: Seleccionar Rol de Doctor
1. Click en "Soy Médico"
2. ✅ **Esperado:** Formulario cambia a campos de doctor

#### Paso 2: Probar Validaciones
1. Probar email inválido: `doctor@invalid`
2. ✅ **Esperado:** Borde rojo + error
3. Probar contraseña débil: `Doc123`
4. ✅ **Esperado:** Barra roja + checklist con errores

#### Paso 3: Completar Registro Exitoso
1. Llenar todos los campos:
   - **Nombre:** Dra. Ana Rodríguez López
   - **Email:** doctor.test@example.com
   - **Contraseña:** DoctorSeguro123!@#
   - **Especialidad:** Medicina Interna
   - **Número de Licencia:** MED-12345678
2. Verificar que la barra de contraseña muestre "Muy Fuerte"
3. Click "Crear Cuenta"
4. ✅ **Esperado:**
   - Cuenta creada exitosamente
   - Redirección a dashboard médico
   - Permisos de doctor activados

---

### **PRUEBA 3: Login con Validación**

**URL:** https://cabo-health-longevity.vercel.app/login

#### Paso 1: Email Inválido
1. Escribir email: `notanemail`
2. ✅ **Esperado:** Borde rojo + mensaje de error
3. Intentar hacer login
4. ✅ **Esperado:** No permite enviar formulario

#### Paso 2: Login Exitoso - Paciente
1. Email: `paciente.test@example.com`
2. Contraseña: `TestPaciente123!@#`
3. Click "Iniciar Sesión"
4. ✅ **Esperado:**
   - Login exitoso
   - Redirección a dashboard de paciente
   - Ver nombre y datos del paciente

#### Paso 3: Login Exitoso - Doctor
1. Logout (si aplica)
2. Email: `doctor.test@example.com`
3. Contraseña: `DoctorSeguro123!@#`
4. Click "Iniciar Sesión"
5. ✅ **Esperado:**
   - Login exitoso
   - Redirección a dashboard médico
   - Ver lista de pacientes o herramientas de doctor

---

### **PRUEBA 4: ErrorBoundary (Difícil de Probar)**

Esta prueba requiere forzar un error en la aplicación.

#### Opción 1: Forzar Error en Desarrollo
1. Abrir DevTools (F12)
2. Ir a Console
3. Ejecutar: `throw new Error("Test error")`
4. ✅ **Esperado en DEV:**
   - Página de error profesional
   - Mensaje "Algo salió mal"
   - Información de desarrollo visible
   - Botones "Recargar Página" y "Ir al Inicio"

#### Opción 2: Verificar en Producción
1. Si ocurre algún error real en producción
2. ✅ **Esperado:**
   - NO se muestra stack trace
   - Solo mensaje amigable en español
   - Botones de recuperación funcionan

---

## 📊 Checklist de Resultados

### Validación de Email
- [ ] Email inválido muestra borde rojo
- [ ] Email inválido muestra mensaje de error
- [ ] Email válido permite continuar
- [ ] Validación funciona en Register y Login

### Validación de Contraseña
- [ ] Checklist aparece al enfocar campo
- [ ] Contraseña < 12 chars muestra error
- [ ] Sin mayúscula muestra X rojo
- [ ] Sin minúscula muestra X rojo
- [ ] Sin número muestra X rojo
- [ ] Sin carácter especial muestra X rojo
- [ ] Contraseña válida muestra todos los checks verdes
- [ ] Indicador de fortaleza funciona (Débil/Media/Fuerte/Muy Fuerte)
- [ ] No permite enviar formulario con contraseña inválida

### Registro y Login
- [ ] Registro de paciente funciona
- [ ] Registro de doctor funciona
- [ ] Login con credenciales correctas funciona
- [ ] Login con credenciales incorrectas muestra error apropiado

### ErrorBoundary
- [ ] No expone stack traces en producción
- [ ] Muestra mensaje amigable en español
- [ ] Botones de recuperación funcionan

---

## 🐛 Reporte de Problemas

Si encuentras algún problema, documenta:

1. **Paso donde ocurrió:** [Descripción]
2. **Comportamiento esperado:** [Lo que debería pasar]
3. **Comportamiento actual:** [Lo que realmente pasó]
4. **Screenshots:** [Si es posible]
5. **Mensajes de error en consola:** [Abrir DevTools F12 > Console]

---

## ✅ Credenciales de Prueba Sugeridas

### Paciente
- **Email:** `paciente.test@example.com`
- **Password:** `TestPaciente123!@#`
- **Nombre:** Juan Pérez García

### Doctor
- **Email:** `doctor.test@example.com`
- **Password:** `DoctorSeguro123!@#`
- **Nombre:** Dra. Ana Rodríguez López

---

**Última actualización:** 5 de Noviembre 2025
**Commits relacionados:**
- `4c58e05`: Password y email validation fixes
- `b61d8c0`: ErrorBoundary security fix
