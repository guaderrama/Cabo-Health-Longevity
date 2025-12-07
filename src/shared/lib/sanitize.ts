/**
 * Sanitización de HTML para prevenir ataques XSS
 * Crítico para datos médicos que pueden contener HTML embebido
 */

import DOMPurify from 'dompurify';
import { logger } from './logger';

// Configuración estricta para contenido médico
const MEDICAL_CONFIG: DOMPurify.Config = {
  // Tags permitidos para formato básico
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'span'],

  // Atributos permitidos (ninguno por defecto para máxima seguridad)
  ALLOWED_ATTR: [],

  // No permitir URLs de datos
  ALLOW_DATA_ATTR: false,

  // No permitir elementos desconocidos
  ALLOW_UNKNOWN_PROTOCOLS: false,

  // Remover elementos peligrosos completamente
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],

  // Remover atributos peligrosos
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
};

// Configuración para contenido rico (reportes médicos con formato)
const RICH_CONTENT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'blockquote', 'pre', 'code', 'a', 'hr'
  ],

  ALLOWED_ATTR: ['href', 'title', 'class'],

  // Validar URLs para prevenir javascript: y data:
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,

  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Sanitiza contenido HTML básico (máxima seguridad)
 * Usar para: nombres, descripciones cortas, comentarios
 */
export function sanitizeBasic(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  try {
    const clean = String(DOMPurify.sanitize(dirty, MEDICAL_CONFIG));

    // Log si se removió contenido peligroso
    if (clean !== dirty) {
      logger.warn('XSS content detected and sanitized', {
        original: dirty.substring(0, 100),
        sanitized: clean.substring(0, 100)
      });
    }

    return clean;
  } catch (error) {
    logger.error('Error sanitizing content', error);
    // En caso de error, retornar string sin HTML
    return dirty.replace(/[<>]/g, '');
  }
}

/**
 * Sanitiza contenido HTML rico (reportes médicos con formato)
 * Usar para: análisis de IA, notas del doctor, reportes
 */
export function sanitizeRichContent(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  try {
    const clean = String(DOMPurify.sanitize(dirty, RICH_CONTENT_CONFIG));

    // Log si se removió contenido peligroso
    if (clean !== dirty) {
      logger.warn('XSS content detected in rich content', {
        originalLength: dirty.length,
        cleanLength: clean.length
      });
    }

    return clean;
  } catch (error) {
    logger.error('Error sanitizing rich content', error);
    // En caso de error, retornar versión básica sanitizada
    return sanitizeBasic(dirty);
  }
}

/**
 * Sanitiza y escapa contenido para usar en atributos HTML
 * Usar para: valores de atributos, URLs, etc.
 */
export function sanitizeAttribute(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Primero sanitizar
  const clean = sanitizeBasic(dirty);

  // Luego escapar para atributos
  return clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza contenido para mostrar como texto plano
 * Remueve TODO el HTML
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  try {
    // Usar DOMPurify para remover todo HTML
    const clean = String(DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    }));

    return clean;
  } catch (error) {
    logger.error('Error sanitizing text', error);
    // Fallback: remover tags manualmente
    return dirty.replace(/<[^>]*>/g, '');
  }
}

/**
 * Hook para React: sanitiza y retorna HTML seguro con dangerouslySetInnerHTML
 */
export function useSanitizedHTML(dirty: string, rich = false) {
  const clean = rich ? sanitizeRichContent(dirty) : sanitizeBasic(dirty);

  return {
    __html: clean
  };
}

/**
 * Validar si un string contiene HTML peligroso
 */
export function containsDangerousHTML(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }

  // Patrones peligrosos
  const dangerousPatterns = [
    /<script[\s>]/i,
    /<iframe[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<embed[\s>]/i,
    /<object[\s>]/i,
    /data:text\/html/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(str));
}

// Configurar DOMPurify hooks para logging
if (typeof window !== 'undefined') {
  DOMPurify.addHook('beforeSanitizeElements', (node) => {
    // Log elementos peligrosos removidos
    if (node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME') {
      logger.warn('Dangerous element removed', {
        element: node.nodeName,
        content: (node.textContent || '').substring(0, 100)
      });
    }
    return node;
  });

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    // Log atributos peligrosos removidos
    if (data.attrName && data.attrName.startsWith('on')) {
      logger.warn('Dangerous attribute removed', {
        attribute: data.attrName,
        value: data.attrValue
      });
    }
  });
}

export default {
  basic: sanitizeBasic,
  rich: sanitizeRichContent,
  attribute: sanitizeAttribute,
  text: sanitizeText,
  useSanitizedHTML,
  containsDangerousHTML
};