import { toast as sonnerToast } from 'sonner';

// Wrapper functions for consistent toast styling
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
      className: 'toast-success',
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
      className: 'toast-error',
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
      className: 'toast-warning',
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
      className: 'toast-info',
    });
  },

  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
      className: 'toast-loading',
    });
  },

  // For async operations with promise
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: 4000,
    });
  },

  // Direct access to dismiss
  dismiss: sonnerToast.dismiss,

  // Custom toast
  custom: sonnerToast.custom,
};

// Export the original toast for advanced usage
export { sonnerToast };