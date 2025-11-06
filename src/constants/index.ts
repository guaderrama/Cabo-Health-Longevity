/**
 * Constantes centralizadas de la aplicación
 * Esto previene typos y facilita refactoring
 */

// Estados de análisis
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type AnalysisStatus = typeof ANALYSIS_STATUS[keyof typeof ANALYSIS_STATUS];

// Niveles de riesgo
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

export const RISK_LEVEL_VALUES = {
  [RISK_LEVELS.LOW]: 1,
  [RISK_LEVELS.MEDIUM]: 2,
  [RISK_LEVELS.HIGH]: 3,
  unknown: 0,
} as const;

// Roles de usuario
export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Configuración de toast
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

// Tamaños de paginación
export const PAGE_SIZES = {
  SMALL: 10,
  DEFAULT: 20,
  LARGE: 50,
} as const;

// Límites de archivo
export const FILE_LIMITS = {
  MAX_SIZE_MB: 20,
  MAX_SIZE_BYTES: 20 * 1024 * 1024, // 20MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
} as const;

// Configuración de gráficos
export const CHART_CONFIG = {
  MAX_ITEMS: 5,
  COLORS: {
    PRIMARY: '#4F46E5',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
  },
} as const;

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PATIENT_REPORT: (id: string) => `/patient/report/${id}`,
  DOCTOR_ANALYSIS: (id: string) => `/doctor/analysis/${id}`,
  DOCTOR_FUNCTIONAL: (id: string) => `/doctor/functional/${id}`,
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error. Por favor, intente nuevamente.',
  NETWORK: 'Error de conexión. Verifique su internet.',
  UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
  SESSION_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
  FILE_TOO_LARGE: `El archivo supera el tamaño máximo de ${FILE_LIMITS.MAX_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Solo se permiten archivos PDF',
} as const;

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  ANALYSIS_UPLOADED: 'Análisis subido exitosamente',
  ANALYSIS_APPROVED: 'Análisis aprobado y enviado al paciente',
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
} as const;

// Validación de contraseñas
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

// Configuración de fecha/hora
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'PPP',
  WITH_TIME: 'PPP p',
  TIME_ONLY: 'p',
} as const;

// Timeouts (en milisegundos)
export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 500,
  AUTO_SAVE: 30000, // 30 segundos
  SESSION_WARNING: 300000, // 5 minutos antes de expirar
  API_REQUEST: 30000, // 30 segundos
} as const;

// Configuración de localStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'app_auth_token',
  USER_PREFERENCES: 'app_user_preferences',
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
  ERROR_LOGS: 'app_error_logs',
} as const;