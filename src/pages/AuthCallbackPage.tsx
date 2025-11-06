import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmando tu email...');
  const navigate = useNavigate();

  useEffect(() => {
    async function handleEmailConfirmation() {
      try {
        // Supabase handles the email confirmation hash automatically
        // We just need to check if the session is valid
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          // Verify email is confirmed
          if (session.user.email_confirmed_at) {
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Redirigiendo al dashboard...');

            // Wait 2 seconds before redirecting
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            throw new Error('El email aún no ha sido confirmado');
          }
        } else {
          throw new Error('No se encontró una sesión válida');
        }
      } catch (err) {
        console.error('Email confirmation error:', err);
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : 'Error al confirmar el email. Por favor intenta nuevamente o contacta soporte.'
        );
      }
    }

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          {status === 'loading' && (
            <div className="bg-blue-600 p-3 rounded-full animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
          )}
          {status === 'success' && (
            <div className="bg-green-600 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-600 p-3 rounded-full">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Confirmando Email'}
          {status === 'success' && '¡Email Confirmado!'}
          {status === 'error' && 'Error de Confirmación'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Volver al Login
            </button>
            <p className="text-sm text-gray-500">
              Si el problema persiste, contacta a soporte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
