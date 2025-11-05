import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const isDevelopment = import.meta.env.DEV;

/**
 * Safely serialize error for logging (internal use only)
 * NEVER expose this to users in production
 */
const serializeErrorForLogging = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\nStack: ${error.stack || 'No stack trace'}`;
  }
  return JSON.stringify(error, null, 2);
};

/**
 * Get user-friendly error message (safe for production)
 */
const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Only show error message, never stack trace
    return error.message || 'Ha ocurrido un error inesperado';
  }
  return 'Ha ocurrido un error inesperado';
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (isDevelopment) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, log to error tracking service (e.g., Sentry, LogRocket)
    // TODO: Implement error tracking service
    // logErrorToService(error, errorInfo);

    this.setState({
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
              Algo salió mal
            </h1>

            <p className="text-center text-gray-600 mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor intente nuevamente.
            </p>

            {/* Only show error message in development, NEVER stack trace */}
            {isDevelopment && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Información de desarrollo:
                </p>
                <p className="text-xs text-red-700 font-mono break-words">
                  {getUserFriendlyMessage(this.state.error)}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Recargar Página
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Ir al Inicio
              </button>
            </div>

            {isDevelopment && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Modo Desarrollo:</strong> Los detalles completos del error están en la consola del navegador.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}