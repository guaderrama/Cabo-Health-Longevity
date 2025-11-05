# ⚡ DEPLOY EN 5 MINUTOS - GUÍA RÁPIDA

## 🚀 OPCIÓN 1: VERCEL (RECOMENDADO - MÁS FÁCIL)

### Paso 1: Ir a Vercel
1. Abre https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**

### Paso 2: Conectar GitHub
1. Click **"Continue with GitHub"**
2. Autorizar Vercel en GitHub
3. Buscar y seleccionar: `cabo-health-clinic`
4. Click **"Import"**

### Paso 3: Configurar Proyecto
En la pantalla de configuración:

**Build Settings:**
- Framework Preset: `Vite`
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

**Environment Variables:**
Agregar estas dos variables:

```
VITE_SUPABASE_URL = https://holtohiphaokzshtpyku.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk
```

### Paso 4: Deploy
Click **"Deploy"** y espera 2-3 minutos.

✅ **¡Listo!** Tu app estará en: `https://cabo-health-clinic.vercel.app`

---

## 🌐 OPCIÓN 2: NETLIFY (ALTERNATIVA)

### Paso 1: Ir a Netlify
1. Abre https://netlify.com
2. Click **"Sign up"** → selecciona GitHub
3. Autoriza Netlify

### Paso 2: Nuevo Sitio
1. Click **"Add new site"** → **"Import an existing project"**
2. Selecciona **GitHub**
3. Busca: `cabo-health-clinic`
4. Click **"Deploy site"**

### Paso 3: Configurar Build
En **"Site settings"** → **"Build & deploy"**:

```
Build command: pnpm build
Publish directory: dist
```

### Paso 4: Variables de Entorno
En **"Build & deploy"** → **"Environment"**, agregar:

```
VITE_SUPABASE_URL=https://holtohiphaokzshtpyku.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Trigger redeploy y ¡listo!

---

## 🚄 OPCIÓN 3: RAILWAY (MÁS PODEROSO)

1. Abre https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Selecciona `cabo-health-clinic`
4. Click **"Deploy Now"**
5. Agregar variables (mismo que arriba)
6. Esperar a que se complete

✅ App estará en: `https://cabohealth.up.railway.app`

---

## 📊 COMPARATIVA RÁPIDA

| Feature | Vercel | Netlify | Railway |
|---------|--------|---------|---------|
| Setup | 5 min | 5 min | 5 min |
| Free Tier | ✅ Muy bueno | ✅ Muy bueno | ✅ Bueno |
| Auto-Deploy | ✅ Sí | ✅ Sí | ✅ Sí |
| Custom Domain | ✅ Fácil | ✅ Fácil | ✅ Fácil |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recomendación:** `Vercel` (mejor performance + Next.js/Vite)

---

## ✅ VERIFICAR QUE FUNCIONA

Después de deploy:

1. Abre tu URL (ej: `https://cabo-health-clinic.vercel.app`)
2. ¿Carga la página?
3. ¿Puedes ver formulario de login?
4. Intenta signup con:
   - Email: `test@gmail.com`
   - Contraseña: `Test1234`
5. ¿Te redirige a dashboard?

Si todo funciona → ✅ **DEPLOYMENT EXITOSO**

Si hay error → Ver logs en el dashboard del proveedor

---

## 🔗 CONFIGURAR DOMINIO PERSONALIZADO

### Vercel
1. Dashboard → Tu proyecto
2. Click **"Settings"** → **"Domains"**
3. Agregar dominio (ej: `cabohealth.com`)
4. Seguir instrucciones DNS
5. Esperar 10-30 minutos

### Netlify
1. Site settings → **Domain management**
2. Click **"Add custom domain"**
3. Ingresar tu dominio
4. Actualizar DNS records

### Railway
1. Settings → **Public Networking**
2. Custom Domain
3. Configurar DNS

---

## 🚀 PRÓXIMO PASO IMPORTANTE

**Antes de publicar a usuarios REALES:**

1. ✅ Ejecutar SQL de RLS en Supabase (ver archivo FIX_RLS_SIGNUP.sql)
2. ✅ Probar signup/login completamente
3. ✅ Probar upload PDF (si funciona localmente, funciona en producción)
4. ✅ Configurar email de confirmación en Supabase Auth
5. ✅ Habilitar backups automáticos en Supabase

---

## 📞 SOPORTE

Si algo no funciona:
- **Vercel**: https://vercel.com/support
- **Netlify**: https://www.netlify.com/support/
- **Railway**: https://railway.app/support

O revisa logs en dashboard:
- Click en tu proyecto
- "Deployments" → última versión
- Click para ver logs detallados
