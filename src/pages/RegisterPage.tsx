import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, UserCircle, Stethoscope, Check, X } from 'lucide-react';
import { validatePassword, validateEmail, type PasswordValidationResult } from '@/lib/validation';
import { PASSWORD_RULES } from '@/constants';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [role, setRole] = useState<'doctor' | 'patient'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Campos específicos
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [emailError, setEmailError] = useState('');
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Memoize regex para mejor performance (evita recrear en cada render)
  const specialCharsRegex = useMemo(
    () => new RegExp(`[${PASSWORD_RULES.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`),
    []
  );

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }

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

    // Validar email
    if (!validateEmail(email)) {
      setError('Por favor ingrese un correo electrónico válido');
      setLoading(false);
      return;
    }

    // Validar contraseña
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(`Contraseña inválida: ${passwordCheck.errors.join(', ')}`);
      setPasswordValidation(passwordCheck);
      setLoading(false);
      return;
    }

    const additionalData = role === 'doctor'
      ? { name, specialty, license_number: licenseNumber }
      : { name, birth_date: birthDate, gender };

    const { error, needsConfirmation } = await signUp(email, password, role, additionalData);

    if (error) {
      setError(error.message || 'Error al crear cuenta. Por favor intente nuevamente.');
      setLoading(false);
    } else if (needsConfirmation) {
      // User needs to confirm email
      setError('');
      setLoading(false);
      // Show success toast and redirect to login
      toast.success('¡Cuenta creada exitosamente!', {
        description: `Hemos enviado un correo de confirmación a: ${email}. Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión. Revisa también tu carpeta de spam si no lo ves.`,
        duration: 8000,
      });
      navigate('/login');
    } else {
      // Email confirmation disabled, user can login immediately
      toast.success('¡Cuenta creada exitosamente!', {
        description: 'Redirigiendo al dashboard...',
        duration: 3000,
      });
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary-600 p-3 rounded-full">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Crear Cuenta
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Únete a Cabo Health
        </p>

        {error && (
          <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`p-4 rounded-lg border-2 transition ${
              role === 'patient'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <UserCircle className={`w-8 h-8 mx-auto mb-2 ${role === 'patient' ? 'text-primary-600' : 'text-gray-400'}`} />
            <div className="font-medium">Soy Paciente</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`p-4 rounded-lg border-2 transition ${
              role === 'doctor'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Stethoscope className={`w-8 h-8 mx-auto mb-2 ${role === 'doctor' ? 'text-primary-600' : 'text-gray-400'}`} />
            <div className="font-medium">Soy Médico</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setShowPasswordHints(true)}
              required
              minLength={PASSWORD_RULES.MIN_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                passwordValidation && !passwordValidation.valid ? 'border-red-500' : 'border-gray-300'
              }`}
            />

            {/* Password strength indicator */}
            {passwordValidation && password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordValidation.strength === 'weak' ? 'w-1/4 bg-red-500' :
                        passwordValidation.strength === 'medium' ? 'w-2/4 bg-yellow-500' :
                        passwordValidation.strength === 'strong' ? 'w-3/4 bg-blue-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordValidation.strength === 'weak' ? 'text-red-600' :
                    passwordValidation.strength === 'medium' ? 'text-yellow-600' :
                    passwordValidation.strength === 'strong' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {passwordValidation.strength === 'weak' ? 'Débil' :
                     passwordValidation.strength === 'medium' ? 'Media' :
                     passwordValidation.strength === 'strong' ? 'Fuerte' :
                     'Muy Fuerte'}
                  </span>
                </div>
              </div>
            )}

            {/* Password requirements */}
            {(showPasswordHints || (passwordValidation && !passwordValidation.valid)) && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <p className="font-medium text-gray-700 mb-2">La contraseña debe contener:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${
                    password.length >= PASSWORD_RULES.MIN_LENGTH ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {password.length >= PASSWORD_RULES.MIN_LENGTH ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Mínimo {PASSWORD_RULES.MIN_LENGTH} caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {/[A-Z]/.test(password) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Una letra mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {/[a-z]/.test(password) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Una letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    /[0-9]/.test(password) ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {/[0-9]/.test(password) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Un número</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    specialCharsRegex.test(password) ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {specialCharsRegex.test(password) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Un carácter especial (!@#$%...)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {role === 'doctor' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ej: Medicina General"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ej: MED-123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
