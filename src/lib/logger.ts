/**
 * Logger centralizado para la aplicación
 * En producción, los logs se pueden enviar a un servicio externo
 * como Sentry, LogRocket, DataDog, etc.
 */

const isDevelopment = import.meta.env.DEV;

interface LogContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? ` [${JSON.stringify(this.context)}]` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  private shouldLog(level: 'debug' | 'log' | 'warn' | 'error'): boolean {
    if (level === 'error') return true; // Always log errors
    return isDevelopment;
  }

  debug(message: string, data?: unknown) {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.debug(formatted, data || '');
    }
  }

  log(message: string, data?: unknown) {
    if (this.shouldLog('log')) {
      const formatted = this.formatMessage('LOG', message, data);
      console.log(formatted, data || '');
    }
  }

  warn(message: string, data?: unknown) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('WARN', message, data);
      console.warn(formatted, data || '');
    }
  }

  error(message: string, error?: unknown) {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('ERROR', message, error);
      console.error(formatted, error || '');

      // En producción, enviar a servicio de logging
      if (!isDevelopment) {
        this.sendToLoggingService({
          level: 'error',
          message,
          error: this.serializeError(error),
          context: this.context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    }
  }

  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    if (typeof error === 'object' && error !== null) {
      return { ...error };
    }
    return { value: error };
  }

  private async sendToLoggingService(logData: Record<string, unknown>) {
    // TODO: Implementar integración con servicio de logging
    // Ejemplos:
    // - Sentry.captureException(error);
    // - LogRocket.captureException(error);
    // - await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logData) });

    // Por ahora, solo guardamos en localStorage para debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
      logs.push(logData);
      // Mantener solo los últimos 50 logs
      if (logs.length > 50) {
        logs.shift();
      }
      localStorage.setItem('app_error_logs', JSON.stringify(logs));
    } catch (e) {
      // Silently fail if localStorage is full
    }
  }

  // Método para recuperar logs de errores (útil para debugging)
  getErrorLogs(): unknown[] {
    if (!isDevelopment) return [];

    try {
      return JSON.parse(localStorage.getItem('app_error_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Limpiar logs antiguos
  clearErrorLogs() {
    localStorage.removeItem('app_error_logs');
  }
}

// Singleton instance
export const logger = new Logger();