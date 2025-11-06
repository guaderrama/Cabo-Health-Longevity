import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, X } from 'lucide-react';
import { validateEmail } from '@/lib/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Por favor ingrese un correo electrónico válido');
    } else {
      setEmailError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar email antes de enviar
    if (!validateEmail(email)) {
      setError('Por favor ingrese un correo electrónico válido');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      // Provide specific error messages
      let errorMessage = 'Credenciales incorrectas. Por favor intente nuevamente.';

      if (error.message.includes('email') && error.message.includes('confirmado')) {
        errorMessage = error.message; // Use the specific message from AuthContext
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos. Por favor verifica tus credenciales.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Tu email no ha sido confirmado. Por favor revisa tu correo.';
      } else if (error.message.includes('too many requests') || error.message.includes('rate limit')) {
        errorMessage = 'Demasiados intentos de inicio de sesión. Por favor espera unos minutos e intenta nuevamente.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      }

      setError(errorMessage);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary-600 p-3 rounded-full">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Cabo Health
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Plataforma Médica Profesional
        </p>

        {error && (
          <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="doctor@example.com"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <X className="w-4 h-4" />
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}
