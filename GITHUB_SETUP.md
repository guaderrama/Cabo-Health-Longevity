# 📤 Pasos para Crear Repositorio GitHub y Hacer Push

## ✅ Lo que ya está hecho

- ✅ Git inicializado localmente
- ✅ Primer commit creado con 168 archivos (46,278 líneas de código)
- ✅ .gitignore configurado para excluir node_modules, .env, build output, etc.

---

## 📋 Pasos para Completar (Manual en GitHub)

### **PASO 1: Crear Repositorio en GitHub**

1. Abre https://github.com/new en tu navegador
2. Completa el formulario:
   - **Repository name**: `cabo-health-clinic`
   - **Description**: `Plataforma integral de gestión de salud con análisis de biomarkers usando inteligencia artificial`
   - **Visibility**: Elige **Public** (para que Vercel pueda acceder)
   - **Initialize with**: Deja todo sin marcar (ya tenemos commit local)
3. Click **"Create repository"**

### **PASO 2: Conectar Repositorio Local a GitHub**

Una vez que veas la pantalla de confirmación en GitHub, ejecuta en terminal:

```bash
cd "c:\Users\admin\Dropbox\Ai\cabo health clinic\cabo health clinic"

# Reemplaza [USERNAME] con tu usuario de GitHub
git remote add origin https://github.com/[USERNAME]/cabo-health-clinic.git

# Cambiar rama a main (estándar en GitHub)
git branch -M main

# Hacer push del código
git push -u origin main
```

#### **Ejemplo real** (reemplaza "tu-usuario"):
```bash
git remote add origin https://github.com/tu-usuario/cabo-health-clinic.git
git branch -M main
git push -u origin main
```

Si te pide credenciales:
- **Usuario**: Tu usuario de GitHub
- **Contraseña**: Tu token personal de GitHub (ver [generar token](https://github.com/settings/tokens))
  - Necesita permisos: `repo` y `workflow`

### **PASO 3: Verificar en GitHub**

1. Abre https://github.com/[USERNAME]/cabo-health-clinic
2. Deberías ver:
   - ✅ 168 archivos subidos
   - ✅ Commit inicial visible en el historial
   - ✅ Branch `main` como predeterminado

---

## 🔧 Solución de Problemas

### Error: "fatal: could not read Username"
```bash
# Solución: Usar token en lugar de contraseña
# Git pedirá credenciales, ingresa:
# Username: tu-usuario-github
# Password: Tu Personal Access Token (no tu contraseña)

# Generar token: https://github.com/settings/tokens/new
```

### Error: "repository not empty"
```bash
# Si GitHub dice que el repo no está vacío:
# Significa que ya existe. En GitHub:
# 1. Ve a https://github.com/[USERNAME]/cabo-health-clinic/settings
# 2. Scroll down a "Danger Zone"
# 3. Click "Delete this repository"
# 4. Vuelve al PASO 1
```

### Error de autenticación SSH
```bash
# Si prefieres SSH en lugar de HTTPS:
# 1. Configura SSH keys: https://github.com/settings/keys
# 2. Luego usa:
git remote add origin git@github.com:[USERNAME]/cabo-health-clinic.git
```

---

## ✨ Resultado Esperado

Después de hacer push, tendrás:
- ✅ Código en GitHub
- ✅ URL pública: `https://github.com/[USERNAME]/cabo-health-clinic`
- ✅ Listo para conectar a Vercel en el siguiente paso

---

## 🚀 Siguiente Paso

Una vez que el código esté en GitHub, procederemos a:
1. Conectar Vercel al repositorio
2. Configurar variables de entorno (Supabase keys)
3. Hacer el deploy automático

**Cuando termines estos pasos, comparte la URL de tu repositorio GitHub (ej: https://github.com/tu-usuario/cabo-health-clinic)** y continuaremos con Vercel.
