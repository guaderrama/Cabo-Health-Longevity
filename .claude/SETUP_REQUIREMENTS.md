# 🛠️ SETUP REQUIREMENTS - Cabo Health Clinic

**Proyecto**: Cabo Health Clinic
**Stack**: Vite + React 18 + TypeScript + Supabase
**Última actualización**: 2025-11-04

---

## 📋 **REQUISITOS PREVIOS**

Antes de poder compilar y correr el proyecto, necesitas:

### 1. **Node.js** (v18 o superior)
```bash
# Verificar si está instalado:
node --version

# Si no está instalado:
# Windows: Descargar desde https://nodejs.org/
# macOS: brew install node
# Linux: sudo apt install nodejs
```

### 2. **pnpm** (Package Manager) ⚠️ **REQUERIDO**
```bash
# Verificar si está instalado:
pnpm --version

# Si NO está instalado:
npm install -g pnpm

# Verificar instalación:
pnpm --version
# Debe mostrar: 9.x.x o superior
```

**¿Por qué pnpm y no npm?**
- ✅ Más rápido (3-5x)
- ✅ Usa menos espacio en disco
- ✅ Lock file más estable
- ✅ Mejor para monorepos

### 3. **GROQ API Key** ⚠️ **CRÍTICO PARA IA**

El proyecto usa **GROQ** (no OpenAI) para análisis de laboratorios con IA.

#### ¿Qué es GROQ?
- API de IA ultra-rápida con modelo LLaMA 3.3 70B
- Gratis para uso moderado
- Más rápido que OpenAI para análisis médicos

#### Cómo obtener tu API Key:

**Paso 1**: Ir a GROQ
```
https://console.groq.com/
```

**Paso 2**: Crear cuenta (gratis)
- Click "Sign Up"
- Usar email o GitHub

**Paso 3**: Crear API Key
- Dashboard → "API Keys"
- Click "Create API Key"
- Nombre: "Cabo Health - Local Dev"
- Copiar key (empieza con `gsk_...`)
- **GUARDAR EN PASSWORD MANAGER**

**Paso 4**: Agregar a .env
```bash
# En cabo-health/.env, descomentar y agregar:
GROQ_API_KEY=gsk_tu_key_aqui
```

#### Verificar que funciona:
```bash
# Test rápido (opcional):
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

---

## 📝 **CONFIGURACIÓN DE .env**

### Archivo: `cabo-health/.env`

#### Estado Actual:
```bash
# Supabase Configuration ✅ CORRECTO
VITE_SUPABASE_URL="https://holtohiphaokzshtpyku.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJI..." # ✅ Ya configurado

# GROQ API ❌ FALTA CONFIGURAR
# GROQ_API_KEY=your_groq_api_key_here

# Google Maps (Opcional)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Acción Requerida:
```bash
# 1. Descomentar línea de GROQ_API_KEY
# 2. Reemplazar "your_groq_api_key_here" con tu key real

# Resultado final:
GROQ_API_KEY=gsk_abc123xyz... # ✅ Tu key real aquí
```

---

## 🚀 **INSTALACIÓN DEL PROYECTO**

Una vez que tienes `pnpm` y `GROQ_API_KEY`:

### Paso 1: Navegar al proyecto
```bash
cd "c:\Users\admin\Dropbox\Ai\cabo health clinic\cabo health clinic\cabo-health"
```

### Paso 2: Instalar dependencias
```bash
pnpm install

# Si da error, usar:
pnpm install --no-frozen-lockfile
```

**Tiempo estimado**: 2-3 minutos

### Paso 3: Verificar .env
```bash
# Asegurarse que GROQ_API_KEY está configurado:
cat .env | grep GROQ

# Debe mostrar:
# GROQ_API_KEY=gsk_...
```

### Paso 4: Compilar proyecto
```bash
pnpm dev
```

**Debe mostrar**:
```
  VITE v6.0.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 5: Abrir en navegador
```
http://localhost:5173
```

**Deberías ver**: Página de login de Cabo Health

---

## 🔍 **TROUBLESHOOTING**

### Error: "pnpm: command not found"
```bash
# Solución:
npm install -g pnpm

# Verificar:
pnpm --version
```

### Error: "GROQ_API_KEY is not defined"
```bash
# Solución:
# 1. Abrir cabo-health/.env
# 2. Descomentar y agregar tu GROQ API key
# 3. Reiniciar servidor (Ctrl+C y pnpm dev)
```

### Error: "Failed to resolve module @/..."
```bash
# Solución:
# Reinstalar dependencias:
rm -rf node_modules
pnpm install
```

### Error: "VITE_SUPABASE_URL is not defined"
```bash
# Solución:
# El archivo .env ya tiene esto configurado.
# Si da error, verificar que el archivo existe:
ls -la .env

# Si no existe:
cp .env.example .env
# Luego agregar GROQ_API_KEY manualmente
```

### Puerto 5173 ocupado
```bash
# Solución 1: Matar proceso
lsof -ti:5173 | xargs kill -9

# Solución 2: Usar otro puerto
pnpm dev -- --port 5174
```

---

## ✅ **CHECKLIST DE SETUP**

Antes de comenzar a desarrollar:

- [ ] Node.js instalado (v18+)
- [ ] pnpm instalado globalmente
- [ ] GROQ API Key obtenida
- [ ] Archivo `.env` configurado con GROQ_API_KEY
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Proyecto compila sin errores (`pnpm dev`)
- [ ] Navegador muestra login en http://localhost:5173
- [ ] Tokens de mcp.json rotados (ver SECURITY_TOKEN_ROTATION.md)

---

## 📊 **OTROS COMANDOS ÚTILES**

### Testing
```bash
# Tests unitarios (Jest)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Build
```bash
# Build para producción
pnpm build

# Preview del build
pnpm preview
```

### Linting
```bash
# Ejecutar linter
pnpm lint
```

### TypeScript
```bash
# Verificar tipos
tsc --noEmit
```

---

## 🔗 **RECURSOS**

- **GROQ Console**: https://console.groq.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vite Docs**: https://vite.dev/
- **pnpm Docs**: https://pnpm.io/

---

## 📞 **AYUDA**

Si tienes problemas con el setup:

1. Verificar que todos los requisitos están instalados
2. Revisar que .env tiene GROQ_API_KEY
3. Intentar `rm -rf node_modules && pnpm install`
4. Verificar logs de error completos

---

**Tiempo estimado total de setup**: 15-20 minutos
**Última verificación**: 2025-11-04
