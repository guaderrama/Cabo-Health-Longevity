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
        // Supabase automatically handles the email confirmation hash from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setStatus('success');
          setMessage('¡Email confirmado exitosamente! Redirigiendo al dashboard...');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('No se pudo confirmar el email');
        }
      } catch (err) {
        console.error('Email confirmation error:', err);
        setStatus('error');
        setMessage('Error al confirmar el email. Por favor intenta nuevamente o contacta soporte.');
      }
    }

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div
            className={`p-4 rounded-full ${
              status === 'loading'
                ? 'bg-blue-100 animate-pulse'
                : status === 'success'
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}
          >
            {status === 'loading' && <Activity className="w-12 h-12 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-600" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Confirmando Email'}
          {status === 'success' && '¡Email Confirmado!'}
          {status === 'error' && 'Error'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Ir al Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Registrarse Nuevamente
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
