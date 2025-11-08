import { PASSWORD_RULES } from '@/constants';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

/**
 * Valida una contraseña según las reglas de seguridad establecidas
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strengthScore = 0;

  // Validaciones básicas
  if (!password) {
    return {
      valid: false,
      errors: ['La contraseña es requerida'],
      strength: 'weak'
    };
  }

  // Longitud mínima
  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${PASSWORD_RULES.MIN_LENGTH} caracteres`);
  } else {
    strengthScore += 1;
  }

  // Mayúsculas
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una letra mayúscula');
  } else {
    strengthScore += 1;
  }

  // Minúsculas
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una letra minúscula');
  } else {
    strengthScore += 1;
  }

  // Números
  if (PASSWORD_RULES.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos un número');
  } else {
    strengthScore += 1;
  }

  // Caracteres especiales
  const specialCharsRegex = new RegExp(`[${PASSWORD_RULES.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !specialCharsRegex.test(password)) {
    errors.push('Debe incluir al menos un carácter especial (!@#$%^&*...)');
  } else {
    strengthScore += 1;
  }

  // Validaciones adicionales de seguridad
  if (password.length >= 16) {
    strengthScore += 1;
  }

  // Verificar patrones comunes débiles
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^111111/,
    /^000000/,
    /^abc123/i,
  ];

  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('La contraseña contiene patrones comunes inseguros');
    strengthScore = Math.max(0, strengthScore - 2);
  }

  // Determinar fortaleza
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (strengthScore <= 2) {
    strength = 'weak';
  } else if (strengthScore <= 4) {
    strength = 'medium';
  } else if (strengthScore <= 5) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Valida un email según formato estándar (RFC 5322 simplificado)
 * ✅ IMPROVED: More robust email validation
 *
 * Prevents common issues:
 * - Double dots (user..name@domain.com)
 * - Leading/trailing dots in local part
 * - Invalid domain names
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  email = email.trim();

  // Length validation (RFC 5321)
  if (email.length > 254) {
    return false;
  }

  // Basic structure validation
  if (!email.includes('@') || email.split('@').length !== 2) {
    return false;
  }

  const [local, domain] = email.split('@');

  // Local part validation
  if (!local || local.length === 0 || local.length > 64) {
    return false;
  }

  // Domain validation
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }

  // Regex validation (more robust)
  // Ensures no consecutive dots, proper formatting, etc.
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // No consecutive dots in domain
  if (domain.includes('..')) {
    return false;
  }

  // No consecutive dots in local
  if (local.includes('..')) {
    return false;
  }

  // Domain must have at least one dot and valid TLD
  if (!domain.includes('.') || domain.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Valida un número de teléfono (formato internacional)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Valida que una fecha de nacimiento sea válida y no futura
 */
export function validateBirthDate(date: string): boolean {
  const birthDate = new Date(date);
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 120, 0, 1); // Max 120 años

  return birthDate <= today && birthDate >= minDate;
}

/**
 * Valida el tamaño de un archivo
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Valida el tipo de un archivo
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Type guard para validar nivel de riesgo
 */
export function isValidRiskLevel(value: unknown): value is 'low' | 'medium' | 'high' {
  return value === 'low' || value === 'medium' || value === 'high';
}

/**
 * Type guard para validar estado de análisis
 */
export function isValidAnalysisStatus(value: unknown): value is 'pending' | 'processing' | 'approved' | 'rejected' {
  return value === 'pending' || value === 'processing' || value === 'approved' || value === 'rejected';
}

/**
 * Type guard para validar rol de usuario
 */
export function isValidUserRole(value: unknown): value is 'doctor' | 'patient' | 'admin' {
  return value === 'doctor' || value === 'patient' || value === 'admin';
}