# Configuración de API Key de Groq

## Paso 1: Obtener API Key

1. Visita https://console.groq.com
2. Crea una cuenta o inicia sesión
3. Ve a la sección **API Keys**
4. Click en **Create API Key**
5. Dale un nombre descriptivo (ej: "Cabo Health")
6. Copia la API key generada (empieza con `gsk_...`)

**IMPORTANTE**: Guarda la API key en un lugar seguro. Solo se muestra una vez.

## Paso 2: Configurar en Supabase

### Opción A: Mediante Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: **cabo-health**
3. Ve a **Project Settings** (icono de engranaje)
4. Click en **Edge Functions** en el menú lateral
5. Scroll hasta **Environment Variables**
6. Click en **Add new secret**
7. Configura:
   - Name: `GROQ_API_KEY`
   - Value: `[tu_api_key_aqui]` (pegar la key copiada)
8. Click **Save**

### Opción B: Mediante CLI de Supabase (Avanzado)

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Login
supabase login

# Configurar secret
supabase secrets set GROQ_API_KEY=gsk_tu_api_key_aqui --project-ref cabo-health
```

## Paso 3: Verificar Configuración

La API key ya está disponible para las edge functions. NO es necesario redesplegar.

Para verificar que funciona:

1. Inicia sesión como paciente en https://2k9vpincinp9.space.minimax.io
2. Sube un PDF de análisis de laboratorio
3. Espera unos segundos
4. Si todo está bien configurado:
   - El análisis se procesará automáticamente
   - Se generará un reporte con IA
   - Aparecerá en el dashboard del médico con el análisis completo

## Modelos Utilizados (Cascada Automática)

El sistema intenta usar los modelos en este orden hasta que uno funcione:

1. **Primario**: `llama-3.3-70b-versatile`
   - Modelo más avanzado
   - Mejor calidad de análisis
   - Puede tener límites de tasa más estrictos

2. **Secundario**: `llama-3.1-70b-versatile`
   - Alternativa robusta
   - Buen balance calidad/velocidad

3. **Terciario**: `llama-3.1-8b-instant`
   - Modelo rápido
   - Para alta carga

4. **Respaldo**: `llama3-70b-8192`
   - Modelo estable de respaldo
   - Garantiza que siempre hay análisis

## Troubleshooting

### Error: "API key inválida"

**Síntoma**: Los análisis se suben pero no se genera el texto de IA.

**Solución**:
1. Verifica que la API key sea válida en https://console.groq.com
2. Asegúrate de copiar la key completa (empieza con `gsk_`)
3. Revisa que el nombre sea exactamente `GROQ_API_KEY` (mayúsculas)

### Error: "Rate limit exceeded"

**Síntoma**: Algunos análisis fallan con error de límite.

**Solución**:
1. Groq tiene límites de uso gratuito
2. El sistema automáticamente intentará con el siguiente modelo
3. Si persiste, espera unos minutos antes de subir más análisis
4. Considera actualizar a un plan de pago en Groq

### Error: "Análisis pendiente de configuración"

**Síntoma**: El campo de análisis muestra este mensaje.

**Solución**:
1. La API key no está configurada o es inválida
2. Sigue los pasos de configuración arriba
3. Asegúrate de guardar correctamente el secret

## Límites de Groq (Plan Gratuito)

- **Requests por minuto**: Varía por modelo
- **Requests por día**: Limitado
- **Tokens por request**: 2000 (configurado en el sistema)

Para uso profesional intensivo, considera un plan de pago.

## Costos Estimados

**Plan Gratuito**: Suficiente para pruebas y uso ligero (5-10 análisis/día)

**Plan Pro** (si lo necesitas):
- $0.0001 - $0.0003 por 1K tokens
- Análisis promedio: ~1500 tokens
- Costo por análisis: $0.0001 - $0.0004 USD
- 100 análisis: ~$0.01 - $0.04 USD

## Soporte

Si tienes problemas:

1. Revisa los logs de la edge function `process-pdf` en Supabase
2. Verifica que la API key esté activa en Groq Console
3. Prueba con un PDF simple de análisis

---

**Nota**: Una vez configurada la API key, el sistema funcionará completamente automático. Los pacientes subirán PDFs y recibirán análisis de IA que los médicos pueden revisar y aprobar.
