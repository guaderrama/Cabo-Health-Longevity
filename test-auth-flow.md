# 🧪 PLAN DE TESTING - FLUJO DE AUTENTICACIÓN

## ⚠️ NOTA IMPORTANTE
Los cambios implementados están en la branch: `claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz`

Para testear en producción, necesitas:
1. Hacer merge a la rama principal
2. Esperar el deploy automático de Vercel
3. O hacer deploy manual de esta branch

---

## 🎯 OBJETIVO DEL TESTING

Verificar que el flujo completo de autenticación funcione correctamente con las mejoras implementadas:
- ✅ Registro de usuarios
- ✅ Confirmación de email (si está habilitada)
- ✅ Login exitoso
- ✅ Manejo de errores específicos
- ✅ Race condition fix en loadUserRole

---

## 🔧 PRE-REQUISITOS

### Opción A: Testing Local
```bash
# 1. Asegúrate de estar en la branch correcta
git checkout claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz

# 2. Instalar dependencias
pnpm install

# 3. Ejecutar en modo desarrollo
pnpm dev

# 4. Abrir navegador en: http://localhost:5173
```

### Opción B: Testing en Build de Producción
```bash
# 1. Build de producción
pnpm build

# 2. Preview del build
pnpm preview

# 3. Abrir navegador en: http://localhost:4173
```

---

## 📋 TESTS A EJECUTAR

### TEST 1: Verificar Configuración de Supabase ⚙️

**Propósito**: Determinar si email confirmation está habilitada

**Pasos**:
1. Ir a: https://holtohiphaokzshtpyku.supabase.co
2. Login con tus credenciales
3. Ir a: `Authentication` → `Settings` → `Email Auth`
4. Verificar estado de "Enable email confirmations"

**Resultados esperados**:
- ✅ Si está DESHABILITADA: Los usuarios pueden login inmediatamente
- ✅ Si está HABILITADA: Los usuarios deben confirmar email primero

**Decisión**: Decide cuál configuración quieres para este test

---

### TEST 2: Registro de Nuevo Usuario (Sin Confirmación) 🆕

**Pre-requisito**: Deshabilitar "Enable email confirmations" en Supabase

**Pasos**:
1. Abrir la aplicación (local o producción)
2. Clic en "¿No tienes cuenta? Regístrate"
3. Seleccionar rol: "Soy Paciente"
4. Completar formulario:
   - Nombre: Test User 1
   - Email: test1@example.com
   - Contraseña: Test123!@# (mín 8 caracteres)
   - Fecha de Nacimiento: 1990-01-01
   - Género: Masculino
5. Clic en "Crear Cuenta"

**Resultados esperados**:
- ✅ NO debe mostrar alerta de confirmación de email
- ✅ Debe redirigir automáticamente a `/dashboard`
- ✅ Dashboard debe cargar correctamente
- ✅ Debe mostrar información del paciente

**Verificación en Supabase**:
1. Ir a: Authentication → Users
2. ✅ Debe aparecer test1@example.com
3. ✅ `email_confirmed_at` debe tener un timestamp
4. Ir a: Table Editor → patients
5. ✅ Debe aparecer registro con el mismo ID

**Posibles errores**:
- ❌ Si muestra "User profile not found": El retry logic no funcionó → Revisar consola
- ❌ Si se queda cargando: Problema de network → Revisar Network tab
- ❌ Si muestra error de contraseña: Verificar que cumpla requisitos

---

### TEST 3: Registro de Nuevo Usuario (Con Confirmación) 📧

**Pre-requisito**: HABILITAR "Enable email confirmations" en Supabase

**Pasos**:
1. Ir a Supabase Dashboard
2. Authentication → Settings → Email Auth
3. HABILITAR "Enable email confirmations"
4. Guardar cambios
5. Volver a la aplicación
6. Clic en "¿No tienes cuenta? Regístrate"
7. Seleccionar rol: "Soy Médico"
8. Completar formulario:
   - Nombre: Dr. Test 2
   - Email: test2@example.com (usa email REAL que puedas revisar)
   - Contraseña: Test123!@#
   - Especialidad: Medicina General
   - Número de Licencia: MED-12345
9. Clic en "Crear Cuenta"

**Resultados esperados**:
- ✅ Debe mostrar alerta con mensaje:
  ```
  ✅ ¡Cuenta creada exitosamente!

  📧 Hemos enviado un correo de confirmación a:
  test2@example.com

  Por favor revisa tu bandeja de entrada y haz clic en el
  enlace de confirmación antes de iniciar sesión.

  💡 Nota: Revisa también tu carpeta de spam si no ves el correo.
  ```
- ✅ Después de cerrar alerta, debe redirigir a `/login`

**Verificación en Email**:
1. ✅ Debe llegar email de Supabase
2. ✅ Email debe contener enlace de confirmación
3. Hacer clic en el enlace

**Resultados al hacer clic en enlace**:
- ✅ Debe redirigir a: `/auth/callback`
- ✅ Debe mostrar "Confirmando Email..." con spinner
- ✅ Debe cambiar a "¡Email Confirmado!" con check verde
- ✅ Debe mostrar "Redirigiendo al dashboard..."
- ✅ Después de 2 segundos debe ir a `/dashboard`
- ✅ Dashboard debe cargar con información del doctor

**Verificación en Supabase**:
1. Ir a: Authentication → Users
2. ✅ test2@example.com debe tener `email_confirmed_at` con timestamp
3. Ir a: Table Editor → doctors
4. ✅ Debe aparecer registro del doctor

**Posibles errores**:
- ❌ Si no llega email: Revisar spam o logs de Supabase
- ❌ Si callback falla: Verificar que la ruta esté configurada
- ❌ Si muestra error en callback: Ver consola del navegador

---

### TEST 4: Login Exitoso ✅

**Pre-requisito**: Tener usuario creado y confirmado (del TEST 2 o TEST 3)

**Pasos**:
1. Si estás logged in, hacer logout
2. Ir a `/login`
3. Ingresar credenciales:
   - Email: test1@example.com (o test2@example.com)
   - Contraseña: Test123!@#
4. Clic en "Iniciar Sesión"

**Resultados esperados**:
- ✅ Debe mostrar "Iniciando sesión..." en el botón
- ✅ NO debe mostrar errores
- ✅ Debe redirigir a `/dashboard`
- ✅ Dashboard debe cargar correctamente
- ✅ Debe mostrar el nombre del usuario
- ✅ Debe mostrar el rol correcto (paciente/doctor)

**Verificación en Consola del Navegador**:
1. Abrir DevTools (F12)
2. Ver Console
3. ✅ Debe mostrar: "Auth state changed: SIGNED_IN"
4. ✅ NO debe mostrar: "User role not found, retrying..."
5. Si muestra retry: ✅ Debe resolver después de 1-3 intentos

---

### TEST 5: Login con Email No Confirmado ⚠️

**Pre-requisito**: Tener "Enable email confirmations" HABILITADO

**Pasos**:
1. Crear nuevo usuario desde Supabase Dashboard directamente:
   - Ir a: Authentication → Users → Add user
   - Email: test-unconfirmed@example.com
   - Password: Test123!@#
   - NO confirmar el email
2. Intentar hacer login con:
   - Email: test-unconfirmed@example.com
   - Password: Test123!@#

**Resultados esperados**:
- ✅ Debe mostrar error ESPECÍFICO:
  ```
  "Tu email aún no ha sido confirmado. Por favor revisa tu
  correo y confirma tu dirección de email."
  ```
- ✅ NO debe permitir el login
- ✅ NO debe redirigir a dashboard

**NO debe mostrar**:
- ❌ "Credenciales incorrectas" (mensaje genérico)
- ❌ "Invalid login credentials"

---

### TEST 6: Login con Credenciales Incorrectas ❌

**Pasos**:
1. Ir a `/login`
2. Intentar login con:
   - Email: test1@example.com
   - Password: PasswordIncorrecta123!

**Resultados esperados**:
- ✅ Debe mostrar error:
  ```
  "Email o contraseña incorrectos. Por favor verifica
  tus credenciales."
  ```

---

### TEST 7: Login con Usuario No Existente ❌

**Pasos**:
1. Ir a `/login`
2. Intentar login con:
   - Email: noexiste@example.com
   - Password: Test123!@#

**Resultados esperados**:
- ✅ Debe mostrar error específico (puede variar):
  - "No existe una cuenta con este correo electrónico"
  - O "Email o contraseña incorrectos"

---

### TEST 8: Validación de Contraseña 🔐

**Pasos**:
1. Ir a `/register`
2. Seleccionar cualquier rol
3. Completar nombre y email
4. En campo de contraseña, escribir: "test"

**Resultados esperados**:
- ✅ Debe mostrar indicador de fortaleza: "Débil" en rojo
- ✅ Debe mostrar requisitos con X rojas:
  - ❌ Mínimo 8 caracteres
  - ❌ Una letra mayúscula
  - ✅ Una letra minúscula
  - ❌ Un número
  - ❌ Un carácter especial

**Continuar escribiendo**: "Test123!@#"

**Resultados esperados**:
- ✅ Debe mostrar indicador: "Muy Fuerte" en verde
- ✅ Todos los requisitos con check verde:
  - ✅ Mínimo 8 caracteres (cumple)
  - ✅ Una letra mayúscula (T)
  - ✅ Una letra minúscula (est)
  - ✅ Un número (123)
  - ✅ Un carácter especial (!@#)

---

### TEST 9: Race Condition Fix 🏁

**Propósito**: Verificar que el retry logic funcione

**Pasos**:
1. Abrir DevTools (F12) → Console
2. Crear nuevo usuario desde `/register`
3. Observar la consola durante el registro

**Resultados esperados**:

**Escenario A (Éxito inmediato)**:
- ✅ Usuario se carga sin reintentos
- ✅ NO aparece mensaje "User role not found, retrying..."
- ✅ Redirige a dashboard inmediatamente

**Escenario B (Con retry)**:
- ✅ Aparece mensaje: "User role not found, retrying... (1/3)"
- ✅ Espera 500ms
- ✅ Intenta nuevamente
- ✅ Encuentra el rol y carga dashboard

**Escenario C (Fallo después de 3 intentos)** - SOLO si hay problema:
- ⚠️ Aparece mensaje: "User role not found, retrying... (3/3)"
- ⚠️ Muestra error: "Perfil de usuario no encontrado. Por favor contacta soporte."
- ⚠️ Si esto pasa, hay un problema con Supabase RLS o la inserción

---

### TEST 10: Navegación entre Páginas 🔄

**Pasos**:
1. Login exitoso → Dashboard
2. Hacer logout
3. Intentar acceder a `/dashboard` manualmente
4. Verificar redirect a `/login`
5. Login nuevamente
6. Verificar redirect a `/dashboard`

**Resultados esperados**:
- ✅ Usuario no autenticado no puede acceder a rutas protegidas
- ✅ Redirect automático a `/login`
- ✅ Después de login, redirect correcto según rol

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "User profile not found"
**Causa**: Race condition - Usuario en auth.users pero no en doctors/patients
**Solución**: El retry logic debería resolverlo. Si persiste:
1. Verificar en Supabase que el usuario existe en la tabla correcta
2. Revisar RLS policies
3. Aumentar número de retries si necesario

### Problema 2: Email de confirmación no llega
**Causa**: Configuración de Supabase o email en spam
**Solución**:
1. Verificar en Supabase → Logs
2. Revisar carpeta de spam
3. Usar email real (no example.com)
4. Verificar SMTP settings en Supabase

### Problema 3: Callback page muestra error
**Causa**: Token expirado o inválido
**Solución**:
1. El enlace de confirmación expira después de cierto tiempo
2. Solicitar nuevo email de confirmación
3. Usar el enlace inmediatamente

### Problema 4: Contraseña no cumple requisitos
**Causa**: Reglas muy estrictas
**Solución**: Asegúrate que la contraseña tenga:
- Mínimo 8 caracteres
- Una mayúscula
- Una minúscula
- Un número
- Un carácter especial (!@#$%...)

---

## ✅ CHECKLIST FINAL

Antes de considerar el testing completo, verifica:

### Funcionalidad Básica
- [ ] Registro de paciente funciona
- [ ] Registro de doctor funciona
- [ ] Login funciona con credenciales correctas
- [ ] Login falla con credenciales incorrectas
- [ ] Logout funciona

### Email Confirmation (si está habilitada)
- [ ] Alerta de confirmación se muestra después de registro
- [ ] Email de confirmación llega
- [ ] Callback page funciona
- [ ] Redirect a dashboard después de confirmar
- [ ] Login falla si email no confirmado

### Manejo de Errores
- [ ] Mensajes de error son específicos y claros
- [ ] Validación de contraseña funciona en tiempo real
- [ ] Validación de email funciona
- [ ] Retry logic maneja race conditions

### UX/UI
- [ ] Indicadores de loading se muestran
- [ ] Redirects son correctos
- [ ] No hay errores en consola
- [ ] Navegación es fluida

---

## 📊 REPORTAR RESULTADOS

Después de completar los tests, documenta:

### Tests Exitosos ✅
```
TEST 2: ✅ PASÓ - Registro sin confirmación funciona
TEST 3: ✅ PASÓ - Registro con confirmación funciona
TEST 4: ✅ PASÓ - Login exitoso
...
```

### Tests Fallidos ❌
```
TEST 5: ❌ FALLÓ - Mensaje genérico en lugar de específico
Detalles: Muestra "Credenciales incorrectas" en lugar de "Email no confirmado"
...
```

### Bugs Encontrados 🐛
```
BUG #1: Race condition no se resuelve después de 3 retries
Pasos para reproducir: ...
Error en consola: ...
```

---

## 🚀 DEPLOY A PRODUCCIÓN

Una vez que todos los tests pasen en local:

1. **Merge a rama principal**:
```bash
git checkout main
git merge claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz
git push origin main
```

2. **Vercel deployará automáticamente**

3. **Repetir tests en producción**:
   - URL: https://jxhuqjo1k4pr.space.minimax.io

4. **Configurar Supabase para producción**:
   - Agregar redirect URL: https://jxhuqjo1k4pr.space.minimax.io/auth/callback

---

## 🆘 SOPORTE

Si encuentras problemas durante el testing:
1. Revisa la consola del navegador (F12 → Console)
2. Revisa el Network tab (F12 → Network)
3. Verifica logs en Supabase Dashboard
4. Contacta al equipo de desarrollo

---

**Última actualización**: Tests creados para commit `f56afe2`
