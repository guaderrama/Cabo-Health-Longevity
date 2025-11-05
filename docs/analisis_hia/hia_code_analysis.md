# Análisis completo del código de HIA (Health Insights Agent)

## Resumen ejecutivo

HIA (Health Insights Agent) es una aplicación de análisis de reportes médicos basada en una arquitectura de agentes y una pila moderna centrada en Streamlit para la interfaz, Supabase para autenticación y persistencia, y Groq para la ejecución de modelos de lenguaje de gran tamaño. El propósito del sistema es permitir que usuarios autenticados carguen reportes clínicos en PDF (principalmente de sangre), extraigan su contenido y reciban análisis e insights personalizados mediante un agente de IA que combina plantillas de prompt, aprendizaje en contexto y un mecanismo robusto de fallback entre modelos.

El repositorio oficial del proyecto se encuentra disponible para consulta pública[^1] y contiene el código fuente, la documentación de instalación y el esquema de base de datos. La aplicación se orienta al análisis de hemogramas y otros paneles frecuentes (metabólico, hepático, lipídico y tiroideo), con un flujo de trabajo que prioriza la seguridad (validaciones de archivos), la resiliencia (reintentos y fallback de modelos), la trazabilidad (sesiones y mensajes) y el cumplimiento de límites operativos (tamaño de PDF, número de páginas, límite diario de análisis).

En términos de arquitectura, el diseño separa responsabilidades de manera clara:入口 principal en Streamlit; autenticación y gestión de sesiones con Supabase; agentes para el análisis y la orquestación de modelos; servicios para integrar la IA; utilidades para extracción de texto y validaciones; y un módulo de configuración con parámetros y prompts. La combinación de estos componentes permite un flujo end-to-end reproducible y auditable, desde la carga del PDF hasta la presentación del análisis al usuario.

Para ilustrar la experiencia de usuario, la Figura 1 muestra un GIF de demostración del flujo principal. Este visual permite apreciar la secuencia de acciones: login, creación de sesión, carga del PDF, visualización del texto extraído, completado del formulario del paciente y generación del análisis.

![Demo de uso de HIA (GIF del README del repositorio)](public/HIA_demo.gif)

En síntesis, HIA logra un buen equilibrio entre practicidad y robustez técnica. No obstante, el análisis del código identifica áreas de mejora que pueden aumentar la precisión clínica del extractor (p. ej., OCR y normalización de unidades), la seguridad de la interfaz (reforzar sanitización y uso seguro de HTML), la observabilidad (telemetría estructurada), la calidad de datos (esquema enriquecido) y la mantenibilidad del código (documentación y pruebas).

## Arquitectura del sistema y estructura del proyecto

La organización del código favorece la separación de responsabilidades y facilita la evolución del sistema. El directorio raíz agrupa archivos de documentación (LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, README) y la carpeta src/, que contiene los módulos funcionales:

- src/main.py: punto de entrada de la aplicación Streamlit.
- src/auth/: servicios de autenticación y gestión de sesión (Supabase).
- src/components/: piezas de interfaz (login, formularios, barra lateral, pie).
- src/config/: parámetros de la app y prompts del sistema.
- src/services/: integración del agente de análisis.
- src/agents/: lógica del agente de análisis y la gestión/orquestación de modelos.
- src/utils/: utilidades para extracción de PDFs y validaciones.

Este diseño permite que cada capa evolucione con mínimos acoplamientos: la UI llama a servicios, los servicios usan agentes, los agentes delegan en un gestor de modelos y utilitarios, mientras que la configuración y los prompts se inyectan de forma centralizada.

Para ofrecer una visión de conjunto, el siguiente mapa resume propósito y relaciones.

Tabla 1. Mapa de módulos (directorio → responsabilidad → relaciones principales)

| Directorio/Archivo          | Responsabilidad principal                                      | Relaciones/Interacciones clave                                                                 |
|-----------------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| src/main.py                 | Entrada de la app, enrutamiento y estado de sesión              | Inicializa SessionManager; muestra login, sidebar, histórico y formulario de análisis           |
| src/auth/auth_service.py    | Autenticación y acceso a Supabase (usuarios, sesiones, mensajes) | Conexión con st-supabase; validación de sesión; CRUD de usuarios/sesiones/mensajes             |
| src/auth/session_manager.py | Gestión de sesión y timeouts; integración con localStorage      | Interactúa con AuthService; mantiene estado de usuario; controla expiración                    |
| src/components/*.py         | UI (login, formulario, sidebar, footer)                         | Capturan entrada del usuario; invocan servicios y agentes                                      |
| src/config/app_config.py    | Parámetros operativos (tamaños, límites, colores UI)            | Consumido por UI, validaciones y extracción de PDF                                             |
| src/config/prompts.py       | Plantillas de prompts para análisis                             | Consumido por el servicio de análisis                                                          |
| src/services/ai_service.py  | Interfaz para el análisis (control de límites y delegación)     | Orquesta AnalysisAgent; oculta complejidad de prompts y sesión                                 |
| src/agents/analysis_agent.py| Orquestación del análisis, rate-limit y aprendizaje en contexto | Usa ModelManager; enriquece prompts; actualiza analítica y base de conocimiento                |
| src/agents/model_manager.py | Gestión de modelos, fallback y reintentos                       | Invoca Groq; implementa jerarquía de modelos y manejo de errores                               |
| src/utils/pdf_extractor.py  | Extracción de texto de PDFs con validaciones previas            | Usa pdfplumber; llamado por la UI; alimenta el análisis                                        |
| src/utils/validators.py     | Validaciones de formulario y contenido médico genérico          | Reutilizado por extractor y formularios                                                        |

La arquitectura se apoya en módulos de configuración que fijan límites operativos y estilos de UI, centralizando ajustes para facilitar el mantenimiento. El siguiente resumen recoge los parámetros clave.

Tabla 2. Resumen de parámetros de app_config (constante → valor → propósito)

| Constante                 | Valor     | Propósito                                                                 |
|---------------------------|-----------|---------------------------------------------------------------------------|
| MAX_UPLOAD_SIZE_MB        | 20        | Límite de tamaño del archivo PDF subido por el usuario                    |
| MAX_PDF_PAGES             | 50        | Máximo de páginas procesables por PDF                                     |
| SESSION_TIMEOUT_MINUTES   | 30        | Tiempo de inactividad antes de expirar la sesión                          |
| ANALYSIS_DAILY_LIMIT      | 15        | Límite diario de análisis por usuario                                     |
| PRIMARY_COLOR             | #64B5F6   | Color principal para la UI                                                |
| SECONDARY_COLOR           | #1976D2   | Color secundario para la UI                                              |
| APP_NAME/DESCRIPTION/ICON | “HIA”/... | Metadatos de la app mostrados en la interfaz                              |

### Estructura de directorios y responsabilidades

La jerarquía del proyecto favorece un flujo claro de datos y una modularidad robusta. La carpeta src/ concentra la lógica de la aplicación; public/ guarda artefatos de soporte como el esquema de base de datos y la demo visual. En particular:

- src/components define la UI modular: páginas de autenticación, formulario de análisis, barra lateral con sesiones, encabezado y pie.
- src/config agrupa parámetros y prompts, evitando dispersión de constantes y facilitando ajustes de comportamiento.
- src/agents y src/services encapsulan la lógica de negocio y la orquestación de IA.
- src/utils incluye utilidades de extracción y validación que sirven al resto de capas.

Tabla 3. Archivos principales por carpeta (nombre → rol → módulos que lo consumen)

| Archivo/Pasta            | Rol en el sistema                                           | Módulos consumidores                                                        |
|--------------------------|--------------------------------------------------------------|------------------------------------------------------------------------------|
| main.py                  | Inicialización y enrutamiento de Streamlit                   | Componentes UI, SessionManager                                              |
| auth/auth_service.py     | Integración con Supabase y persistencia de sesión/mensajes   | SessionManager, componentes de UI                                           |
| session_manager.py       | Estado de sesión, expiración, persistencia en localStorage   | main.py, componentes de UI                                                  |
| components/analysis_form.py | Formulario de carga y análisis de reportes                | main.py; invoca ai_service y pdf_extractor                                  |
| config/prompts.py        | Plantillas de sistema para el análisis médico                | services/ai_service.py                                                      |
| agents/analysis_agent.py | Control de límites, preprocesamiento y prompts enriquecidos  | services/ai_service.py                                                      |
| agents/model_manager.py  | Selección y fallback de modelos Groq                         | agents/analysis_agent.py                                                    |
| utils/pdf_extractor.py   | Extracción y validación de texto en PDF                      | components/analysis_form.py                                                 |
| utils/validators.py      | Validaciones de entrada (PDF, email, contraseña, etc.)       | pdf_extractor.py, formularios de auth                                       |
| config/app_config.py     | Parámetros operativos y de UI                                | Consumido por toda la app según necesidad                                   |

### Patrones y decisiones de diseño

La aplicación adopta varios patrones de diseño orientados a claridad y robustez:

- Separación por capas: UI, servicios, agentes, utilidades y configuración. Cada capa expone interfaces sencillas, evitando acoplamientos directos.
- Agent-based orchestration: el AnalysisAgent coordina el análisis, el rate limit y el aprendizaje en contexto; el ModelManager gestiona los modelos y el fallback. Esta separación permite evolucionar la lógica de análisis sin tocar la integración con la UI.
- Integración con Groq: el gestor de modelos utiliza un único proveedor con una jerarquía de “tiers” (primary, secondary, tertiary, fallback). Ante fallos o límites de tasa, se reintenta con el siguiente modelo.
- Session persistence: el SessionManager combina tokens de Supabase con localStorage para mejorar la experiencia de sesión del usuario.

Tabla 4. Flujo de control: Entrada → Componente → Salida

| Entrada (UI/Evento)                      | Componente principal               | Salida/Resultado                                      |
|------------------------------------------|------------------------------------|-------------------------------------------------------|
| Usuario hace login                        | AuthService                        | Token y datos de usuario persistidos                  |
| Usuario crea sesión                       | SessionManager + AuthService       | Registro en chat_sessions y establecimiento de contexto |
| Usuario sube PDF                          | pdf_extractor + validators         | Texto extraído y validado                             |
| Envío de formulario de análisis           | ai_service → AnalysisAgent          | Texto del análisis y modelo usado                     |
| Carga de historial de sesión              | AuthService (get_session_messages) | Mensajes previos para UI                              |
| Fallo de modelo por rate limit            | ModelManager                       | Reintento con siguiente tier                          |

### Flujo de datos end-to-end

El recorrido típico del usuario es el siguiente: autenticación → creación de sesión → selección y carga del PDF → validación y extracción de texto → completado del formulario → análisis por el agente de IA → persistencia del intercambio como mensajes de chat → actualización de analítica y base de conocimiento. Este flujo asegura trazabilidad y continuidad entre sesiones.

Tabla 5. Secuencia de pasos (actor → acción → store/DB → estado de sesión)

| Actor        | Acción                               | Store/DB                              | Estado de sesión actualizado                   |
|--------------|--------------------------------------|----------------------------------------|------------------------------------------------|
| Usuario      | Login                                 | Supabase Auth                          | auth_token y user                              |
| Usuario      | Crear sesión                          | Tabla chat_sessions                    | current_session                                |
| Usuario      | Subir PDF                             | Validación y extracción en memoria     | report_source y contenido del PDF              |
| Usuario      | Enviar formulario                     | Guardar mensaje “user” en chat_messages| Historial de la sesión                         |
| Sistema      | Generar análisis                      | Guardar mensaje “assistant” en chat_messages| current_session y analítica de uso        |
| Sistema      | Actualizar contadores y “knowledge base” (en memoria) | N/A                               | analysis_count, models_used, knowledge_base    |

## Procesamiento de PDFs médicos

El procesamiento de PDFs se realiza en dos etapas: validación de archivo y extracción de texto. El extractor utiliza pdfplumber para abrir el archivo y recorrer sus páginas, recopilando el texto con page.extract_text(). Antes de la extracción, se aplican controles de tamaño y tipo de archivo; después, un validador de contenido verifica longitud mínima y presencia de términos médicos básicos.

En la UI, el componente de formulario ofrece dos fuentes de contenido: carga de un PDF propio o uso de un reporte de muestra. El texto extraído se muestra en un expander para transparencia del usuario y, de ser válido, se envía al agente de análisis junto con los datos del paciente.

Tabla 6. Reglas de validación (validate_pdf_file y validate_pdf_content)

| Tipo de validación            | Criterio                                                                                 | Mensaje de error típico                                                     |
|-------------------------------|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Tamaño de archivo             | ≤ MAX_UPLOAD_SIZE_MB (20 MB)                                                             | “File size … exceeds the 20MB limit”                                        |
| Tipo de archivo               | MIME type debe ser ‘application/pdf’                                                     | “Invalid file type. Please upload a PDF file”                                |
| Páginas del PDF               | ≤ MAX_PDF_PAGES (50 páginas)                                                             | “PDF exceeds maximum page limit of 50”                                      |
| Texto extraído                | Longitud mínima (≥ 50 caracteres)                                                        | “Extracted text is too short …”                                             |
| Indicadores médicos           | Al menos 3 coincidencias de lista de términos médicos genéricos                          | “The uploaded file doesn’t appear to be a medical report …”                 |
| Scanned PDF                   | page.extract_text() vacía o nula                                                         | “Could not extract text from PDF. Please ensure it’s not a scanned document.” |

### Validación y extracción de texto

Las validaciones previas protegen al sistema de cargas indebidas y mejoran la experiencia al anticipar errores. En la extracción, el extractor itera por cada página hasta alcanzar el límite de 50; si alguna página no produce texto, se asume PDF escaneado y se aborted el procesamiento con un mensaje claro.

Tabla 7. Controles de entrada y salida por paso (validación/entrada → acción → salida)

| Validación/Entrada           | Acción                                     | Salida/Resultado                           |
|------------------------------|--------------------------------------------|--------------------------------------------|
| Tipo y tamaño de archivo     | Comprobar MIME y bytes                     | Aceptar o rechazar con mensaje             |
| Número de páginas            | Validar contra MAX_PDF_PAGES               | Continuar o devolver mensaje de límite     |
| Contenido por página         | extract_text() en loop                     | Concatenar texto o fallar por PDF escaneado|
| Texto global                 | Validar longitud y términos médicos        | Aceptar o rechazar por contenido insuficiente|

### Limitaciones y casos límite

- PDFs escaneados sin capa de texto: el extractor no realiza OCR, por lo que falla al no encontrar texto. Esta limitación afecta la usabilidad con documentos-image.
- Variabilidad de formatos: la validación es genérica (términos básicos). No se normalizan unidades ni rangos de referencia, lo que puede introducir ruido en el análisis.
- Límite de tamaño y páginas: ante cargas grandes, el flujo se detiene early, devolviendo mensajes específicos.

Tabla 8. Casos límite → comportamiento → mensaje

| Caso límite                              | Comportamiento actual                         | Mensaje devuelto                                                 |
|------------------------------------------|-----------------------------------------------|------------------------------------------------------------------|
| PDF escaneado                             | Falla al extraer texto                         | “Could not extract text from PDF …”                              |
| >50 páginas                               | Detiene procesamiento                          | “PDF exceeds maximum page limit of 50”                           |
| Archivo >20MB                             | Rechazo early                                  | “File size … exceeds the 20MB limit”                             |
| Texto con menos de 50 caracteres          | Rechazo por contenido                          | “Extracted text is too short …”                                  |
| Texto sin términos médicos suficientes    | Rechazo por validación                         | “The uploaded file doesn’t appear to be a medical report …”      |

## Sistema de análisis de IA

El sistema de IA se compone de un agente de análisis (AnalysisAgent) que controla límites, preprocesa datos, construye prompts enriquecidos y actualiza una “base de conocimiento” en memoria; y un gestor de modelos (ModelManager) que selecciona y ejecuta modelos Groq con un mecanismo de fallback automático.

El AnalysisAgent aplica un límite diario de análisis por usuario, reseteando las 24 horas. Cuando se recibe una solicitud de análisis, el agente verifica el límite, preprocesa los datos (dejando solo nombre, edad, género y texto del reporte) y construye un prompt mejorado con contexto de la base de conocimiento y el historial de la sesión. El resultado se persiste y se actualiza la analítica del uso (contadores y modelos utilizados).

El ModelManager implementa una jerarquía de cuatro niveles de modelos, con parámetros consistentes de temperatura y tokens máximos, y reintenta con el siguiente modelo ante fallos o indicios de rate limit. Esta cascada mejora la resiliencia del sistema frente a cuotas o interrupciones temporales.

Tabla 9. Model tiers (tier → modelo → proveedor → tokens → temperatura)

| Tier       | Modelo                                 | Proveedor | max_tokens | temperature |
|------------|----------------------------------------|-----------|------------|-------------|
| Primary    | meta-llama/llama-4-maverick-17b-128e-instruct | Groq      | 2000       | 0.7         |
| Secondary  | llama-3.3-70b-versatile                | Groq      | 2000       | 0.7         |
| Tertiary   | llama-3.1-8b-instant                   | Groq      | 2000       | 0.7         |
| Fallback   | llama3-70b-8192                        | Groq      | 2000       | 0.7         |

Tabla 10. Flujo de generación (entrada → preprocesamiento → prompt → modelo → salida)

| Entrada (datos del paciente + reporte) | Preprocesamiento                   | Prompt aplicado                                      | Selección de modelo                   | Salida (análisis)                                   |
|----------------------------------------|------------------------------------|------------------------------------------------------|---------------------------------------|-----------------------------------------------------|
| patient_name, age, gender, report      | Recorte de campos relevantes       | Sistema base + contexto de conocimiento + historial | Primary → fallback si falla           | Texto estructurado del análisis + modelo utilizado  |

### AnálisisAgent y aprendizaje en contexto

El agente mantiene una “knowledge base” en memoria que asocia indicadores de salud con perfiles de paciente y fragmentos de análisis previos. Al construir el prompt, agrega secciones con aprendizajes relevantes y un resumen acotado de la conversación reciente (dos intercambios, truncados a 200 caracteres) para evitar la explosión de tokens. Esta técnica busca consistencia y mejora progresiva del análisis en sesiones prolongadas, aunque depende de datos en memoria (volátiles) y de una heurística básica para seleccionar indicadores y extraer snippets.

Tabla 11. Contexto agregado → sección de prompt → objetivo

| Contexto agregado                                 | Sección en prompt                            | Objetivo                                  |
|---------------------------------------------------|-----------------------------------------------|-------------------------------------------|
| Insights previos por indicador y perfil           | “Relevant Learning From Previous Analyses”    | Conectar patrones observados              |
| Últimos intercambios de la sesión (truncados)     | “Current Session History”                     | Mantener coherencia y continuidad         |

### Gestión y fallback de modelos

El ModelManager selecciona el modelo según el número de reintentos (0→Primary, 1→Secondary, 2→Tertiary, 3→Fallback). Ante una excepción, analiza el mensaje de error en minúsculas; si contiene “rate limit” o “quota”, aplica una breve espera (sleep) antes del siguiente intento. El registro es informativo, y cada invocación exitosa retorna el contenido generado junto con el identificador del modelo usado.

Tabla 12. Errores comunes → estrategia → siguiente tier

| Error detectado               | Estrategia                               | Siguiente acción                       |
|------------------------------|-------------------------------------------|----------------------------------------|
| rate limit / quota           | Esperar breve tiempo y reintentar         | Avanzar al siguiente tier              |
| Excepción genérica de modelo | Log y avance inmediato al siguiente tier  | Intentar con siguiente tier            |
| Falla de inicialización      | Reintentar o avanzar                      | Reintentar generación o siguiente tier |

Tabla 13. Resumen de modelos (ID → propósito → uso en fallback)

| ID del modelo                               | Propósito principal                      | Uso típico en fallback                    |
|---------------------------------------------|------------------------------------------|-------------------------------------------|
| meta-llama/llama-4-maverick-17b-128e-instruct | Primera opción por capacidades           | Intentos iniciales (retry_count=0)        |
| llama-3.3-70b-versatile                     | Alternativa de alta capacidad            | Segundo intento (retry_count=1)           |
| llama-3.1-8b-instant                        | Opción rápida para resiliencia           | Tercer intento (retry_count=2)            |
| llama3-70b-8192                             | Respaldo estable                          | Cuarto intento (retry_count=3)            |

### Prompts y salida estructurada

El prompt principal de la aplicación instruye al modelo para realizar un análisis comprensivo que cubre secciones típicas de reportes (hemograma, función hepática, páncreas, metabolismo, lípidos) y condiciones frecuentes (anemia, infecciones, diabetes, dislipidemia, hepatitis, etc.). El formato de salida demanda un apartado de riesgos potenciales con nivel de evidencia desde los valores del reporte y recomendaciones prácticas (dieta, estilo de vida, pruebas de seguimiento, urgencia de consulta). Esta estructura favorece consistencia y legibilidad, aunque deja abierta la calibración clínica fina (rangos y unidades por laboratorio).

Tabla 14. Sección de prompt → elemento de salida esperado

| Sección de prompt                 | Elemento de salida esperado                                   |
|-----------------------------------|----------------------------------------------------------------|
| Cobertura clínica (CBC, LFT, etc.)| Lista de condiciones posibles con evidencias del reporte       |
| Formato de riesgos                | Riesgos con nivel (Low/Medium/High) y soporte en valores      |
| Recomendaciones                   | Medidas prácticas, pruebas de seguimiento y urgencia de visita|

## Esquema de base de datos y estructura

El esquema de persistencia en Supabase está compuesto por tres tablas principales: users, chat_sessions y chat_messages. La relación entre ellas es directa: un usuario tiene muchas sesiones, y cada sesión tiene muchos mensajes. Se agregan índices para optimizar consultas y una restricción de unicidad de email en la tabla de usuarios.

El diagrama oficial del esquema se muestra en la Figura 2 y el script SQL público define los tipos y constraints.

![Diagrama del esquema de base de datos (public/db/schema.png)](public/db/schema.png)

Tabla 15. Resumen de tablas (nombre → columnas → tipos → constraints → índices)

| Tabla          | Columnas principales                                           | Tipos        | Constraints                                | Índices                           |
|----------------|----------------------------------------------------------------|--------------|--------------------------------------------|-----------------------------------|
| users          | id, email, name, created_at                                    | UUID, TEXT   | PK (id), UNIQUE(email)                     | —                                 |
| chat_sessions  | id, user_id, title, created_at                                 | UUID, TEXT   | PK (id), FK (user_id → users.id)           | idx_chat_sessions_user_id         |
| chat_messages  | id, session_id, content, role, created_at                      | UUID, TEXT   | PK (id), FK (session_id → chat_sessions.id)| idx_chat_messages_session_id      |

Operaciones típicas del AuthService incluyen: signup (con datos adicionales en users), signin, sign_out, create_session, get_user_sessions, save_chat_message, get_session_messages y delete_session. El servicio también intenta restaurar la sesión a partir del token persistente de Supabase y valida tokens en el arranque, protegiendo contra estados inconsistentes.

Tabla 16. Operaciones → tabla objetivo → campos clave

| Operación               | Tabla            | Campos clave utilizados                                           |
|-------------------------|------------------|-------------------------------------------------------------------|
| sign_up                 | users            | id, email, name, created_at                                       |
| sign_in                 | Supabase Auth    | email, password                                                   |
| create_session          | chat_sessions    | user_id, title, created_at                                        |
| get_user_sessions       | chat_sessions    | user_id, order by created_at desc                                 |
| save_chat_message       | chat_messages    | session_id, content, role, created_at                             |
| get_session_messages    | chat_messages    | session_id, order by created_at                                   |
| delete_session          | chat_sessions, chat_messages | session_id ( deletes messages first )                  |

## Interfaz de usuario y flujo de datos en Streamlit

La UI se estructura en torno a un estado de sesión centralizado y componentes modulares. El flujo start-to-finish es el siguiente: si el usuario no está autenticado, se presenta la página de login; una vez autenticado, se muestra la barra lateral para crear o seleccionar sesiones; en el área principal, si existe una sesión activa, se presenta el histórico de mensajes y el formulario de análisis; si no hay sesión, se muestra una pantalla de bienvenida con opción de crear una.

El formulario de análisis permite elegir entre “Upload PDF” o “Use Sample PDF”, valida tamaño y tipo de archivo, extrae y presenta el texto en un expander, y recopila datos del paciente. Tras el envío, se verifica el límite diario, se guarda el mensaje del usuario, se invoca el servicio de análisis y se persiste el mensaje del asistente. La interfaz se actualiza automáticamente para reflejar el historial completo.

La barra lateral expone un contador del límite diario y una lista de sesiones previas, con opción de borrado confirmada mediante una UI de confirmación escalonada. Se implementa además un logout que limpia el estado y la persistencia local.

Tabla 17. Flujo de UI (pantilla → entrada → acción → persistencia → feedback)

| Pantalla/Componente  | Entrada del usuario                       | Acción del sistema                              | Persistencia (DB)                 | Feedback en UI                        |
|----------------------|-------------------------------------------|--------------------------------------------------|-----------------------------------|---------------------------------------|
| Login/Signup         | Email, password, name                     | Validación, sign_up/sign_in                      | users (sign_up)                   | Errores/éxito en UI                   |
| Sidebar              | Botón “New Session”                       | Crear sesión                                     | chat_sessions                     | current_session actualizado           |
| Análisis (form)      | PDF o muestra, datos del paciente         | Extraer texto, validar, enviar a análisis        | chat_messages (user + assistant)  | Mensajes, errores y spinner           |
| Historial            | Selección de sesión                       | Cargar mensajes                                  | chat_messages                     | Render del histórico                  |
| Logout               | Botón “Logout”                            | Cerrar sesión y limpiar estado                   | sign_out (Auth)                   | Pantalla de login                     |

### Autenticación y sesiones

La restauración de sesión se apoya en Supabase (get_session y get_user). SessionManager añade controles de expiración por inactividad y valida tokens contra el estado almacenado. La persistencia en localStorage se instrumenta mediante scripts de almacenamiento y limpieza que expone funciones window.saveAuthData, window.clearAuthData y window.getAuthData para sincronizar datos entre el navegador y el estado de Streamlit.

Tabla 18. Estado de sesión (clave → origen → uso)

| Clave de estado     | Origen (Supabase/Streamlit) | Uso principal                                         |
|---------------------|------------------------------|-------------------------------------------------------|
| auth_token          | Supabase/LocalStorage        | Autenticación en requests y validación de sesión      |
| user                | Supabase                     | Información del usuario (id, email, name)             |
| current_session     | chat_sessions                | Contexto activo de conversación                       |
| last_activity       | Streamlit                    | Control de expiración por inactividad                 |
| analysis_count      | Streamlit                    | Límite diario de análisis                             |

### Formulario y experiencia de usuario

El formulario favorece la transparencia al presentar el texto extraído del PDF. Se instrumentan ayudas y mensajes de error específicos para tamaño, tipo de archivo, contenido insuficiente o PDF escaneado. El feedback durante el análisis incluye un spinner y, al finalizar, el mensaje del asistente se guarda y se muestra en el histórico.

Tabla 19. Controles de entrada (campo → validación → mensaje)

| Campo/Entrada         | Validación aplicada                                         | Mensaje de error                                   |
|-----------------------|--------------------------------------------------------------|----------------------------------------------------|
| Archivo PDF           | Tamaño ≤20MB; MIME=‘application/pdf’; páginas ≤50           | “File size … exceeds the 20MB limit”, etc.         |
| Texto extraído        | Longitud mínima; presencia de términos médicos               | “Extracted text is too short …”, etc.              |
| Datos del paciente    | Todos los campos requeridos                                  | “Please fill in all fields”                        |

## Configuraciones y dependencias

La configuración de entorno se gestiona con variables de secreto de Streamlit (secrets.toml) y parámetros definidos en app_config. El sistema depende de un conjunto acotado de paquetes con versiones mínimas.

Tabla 20. Dependencias (paquete → versión mínima → propósito)

| Paquete                 | Versión mínima | Propósito                                                    |
|-------------------------|----------------|--------------------------------------------------------------|
| streamlit               | 1.42.0         | Framework de UI                                              |
| st-supabase-connection  | 2.0.1          | Conexión a Supabase                                          |
| groq                    | 0.18.0         | Cliente de modelos Groq                                      |
| pdfplumber              | 0.11.5         | Extracción de texto de PDFs                                  |
| filetype                | 1.2.0          | Detección de tipo de archivo                                 |
| gotrue                  | —              | Integración con GoTrue/Supabase (auth)                       |

Tabla 21. Parámetros de configuración (origen → clave → valor por defecto → efecto)

| Origen        | Clave                          | Valor por defecto | Efecto en runtime                                       |
|---------------|--------------------------------|-------------------|---------------------------------------------------------|
| secrets.toml  | SUPABASE_URL                   | —                 | URL de Supabase para conexión                           |
| secrets.toml  | SUPABASE_KEY                   | —                 | Clave de Supabase para conexión                         |
| secrets.toml  | GROQ_API_KEY                   | —                 | Autenticación con Groq                                  |
| app_config.py | MAX_UPLOAD_SIZE_MB             | 20                | Límite de tamaño de PDF                                 |
| app_config.py | MAX_PDF_PAGES                  | 50                | Límite de páginas de PDF                                |
| app_config.py | SESSION_TIMEOUT_MINUTES        | 30                | Tiempo de inactividad antes de expirar sesión           |
| app_config.py | ANALYSIS_DAILY_LIMIT           | 15                | Límite diario de análisis                               |

## Funcionalidades clave y evidencia en código

Varias funcionalidades son críticas para la efectividad operativa de HIA:

- Rate limiting diario: implementado en AnalysisAgent con reseteo cada 24 horas y cálculo de tiempo restante hasta reinicio.
- Aprendizaje en contexto: la base de conocimiento en memoria mapea indicadores médicos y perfiles de paciente con snippets del análisis previo, y el prompt se enriquece con esos datos y un resumen de la conversación reciente.
- Fallback de modelos: ModelManager aplica una jerarquía de cuatro niveles y reintentos automáticos ante rate limits o fallos.
- Persistencia de sesiones y mensajes: AuthService integra Supabase para almacenar sesiones y mensajes, habilitando historial y continuidad.
- Validaciones robustas: validators y pdf_extractor aplican múltiples capas de control (tamaño, tipo, longitud, términos médicos).
- UI responsive: componentes modulares, spinner durante el análisis, confirmación para borrado de sesiones y mensajes informativos.

Tabla 22. Funcionalidad → módulo → evidencia en código → impacto

| Funcionalidad                     | Módulo (archivo)                 | Evidencia en código                                               | Impacto en operatividad                                 |
|-----------------------------------|----------------------------------|-------------------------------------------------------------------|---------------------------------------------------------|
| Rate limit diario                 | agents/analysis_agent.py         | check_rate_limit(); reset cada 24h; contador y marca temporal     | Control de uso y protección de recursos                 |
| Aprendizaje en contexto           | agents/analysis_agent.py         | knowledge_base; _build_enhanced_prompt; extracción de snippets    | Consistencia y mejora progresiva del análisis           |
| Fallback de modelos               | agents/model_manager.py          | MODEL_CONFIG con tiers; manejo de errores; retry_count            | Resiliencia frente a fallos o cuotas                    |
| Persistencia de sesiones/mensajes | auth/auth_service.py             | create_session, save_chat_message, get_session_messages           | Historial y trazabilidad del intercambio                |
| Validaciones de PDF               | utils/pdf_extractor.py, validators.py | validate_pdf_file/content; límites de tamaño/páginas          | Calidad y seguridad de datos de entrada                 |
| UI modular y feedback             | components/*.py                  | Spinner, expanders, confirmaciones, contador de límite diario     | Experiencia de usuario clara y controlada               |

## Áreas de mejora identificadas

- OCR para PDFs escaneados: integrar OCR (por ejemplo, Tesseract o un servicio cloud) permitiría analizar reportes sin capa de texto, ampliando cobertura de documentos.
- Normalización de unidades y rangos: incorporar un diccionario por laboratorio y unidad, con conversión y validación de rangos de referencia, mejoraría la precisión clínica del análisis.
- Mejoras en seguridad y sanitización: reforzar la sanitización de HTML generado (evitar inyección), reducir el uso de unsafe_allow_html y gestionar secretos fuera del cliente cuando sea posible.
- Observabilidad: añadir logging estructurado, métricas y trazas para supervisar fallos, latencia, modelos utilizados y efectividad del fallback.
- Pruebas automatizadas: cobertura de unit tests para agentes, servicios, validaciones y extracción de PDF; pruebas de integración de UI.
- Esquema de DB enriquecido: incluir metadatos de análisis (modelo usado, parámetros, tokens, tiempos), hash del PDF y flags de calidad del texto (longitud, número de términos médicos detectados).
- Mantenibilidad del código: mejorar documentación y tipado, estandarizar estilo y separar responsabilidades en módulos que hoy combinan lógica y presentación.

Tabla 23. Issue/Mejora → impacto → esfuerzo estimado → prioridad

| Mejora sugerida                              | Impacto esperado                           | Esfuerzo estimado | Prioridad |
|----------------------------------------------|--------------------------------------------|-------------------|-----------|
| OCR para PDFs escaneados                     | Cobertura de casos reales aumentable       | Medio-Alto        | Alta      |
| Normalización de unidades y rangos           | Precisión clínica y comparabilidad         | Medio             | Alta      |
| Seguridad/sanitización                       | Reducción de riesgos de UI                 | Medio             | Alta      |
| Observabilidad (logs, métricas)              | Diagnóstico proactivo                      | Medio             | Media     |
| Pruebas automatizadas                        | Calidad y regressions controladas          | Alto              | Alta      |
| Esquema de DB enriquecido                    | Analítica y trazabilidad mejoradas         | Medio             | Media     |
| Documentación y tipado                       | Mantenibilidad y onboarding                | Bajo-Medio        | Media     |

## Anexos

- Diagrama del esquema de base de datos (public/db/schema.png).
- Script SQL de creación de tablas (public/db/script.sql).

![Esquema de BD en Supabase (public/db/schema.png)](public/db/schema.png)

## Referencias

[^1]: Repositorio GitHub de HIA (Health Insights Agent). https://github.com/harshhh28/hia  
[^2]: GIF de demostración del README de HIA. https://raw.githubusercontent.com/harshhh28/hia/main/public/HIA_demo.gif  
[^3]: Imagen del esquema de base de datos en el repositorio. https://raw.githubusercontent.com/harshhh28/hia/main/public/db/schema.png  
[^4]: Script SQL del esquema de base de datos. https://github.com/harshhh28/hia/blob/main/public/db/script.sql  
[^5]: Archivo requirements.txt del repositorio. https://github.com/harshhh28/hia/blob/main/requirements.txt

### Breve nota sobre vacíos de información

- El README describe archivos de agentes no presentes en el árbol revisado (agent_manager.py, model_fallback.py); el código funcional reside en model_manager.py y services/ai_service.py.
- El esquema de DB visible cubre usuarios, sesiones y mensajes; no hay metadatos de análisis (modelo usado, tokens, tiempos) ni hash del PDF.
- No se observan pruebas automatizadas en el repositorio.
- La validación de contenido es genérica; falta normalización de unidades y rangos de referencia por laboratorio.
- La persistencia de la “knowledge base” se realiza en memoria; no hay persistencia ni versionado.
- La seguridad de UI incluye uso de HTML con unsafe_allow_html; se recomienda reforzar sanitización.