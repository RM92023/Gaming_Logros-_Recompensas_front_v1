import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../hooks/useAuth';
import { loginSchema, registerSchema, type LoginInput } from '../schemas/auth.schema';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRegister, setShowRegister] = useState(false);

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar con Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpiar error del campo
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  if (showRegister) {
    return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Recompensas Gaming
            </h1>
            <p className="text-gray-400">Inicia sesión para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Error general */}
            {loginMutation.isError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">
                  {(loginMutation.error as any)?.response?.data?.message || 
                   'Error al iniciar sesión. Verifica tus credenciales.'}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-purple-400 hover:text-purple-300 font-semibold transition"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Register Form Component
function RegisterForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const registerMutation = useRegister();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar con Zod
    const { registerSchema } = await import('../schemas/auth.schema');
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    registerMutation.mutate(formData, {
      onSuccess: (data) => {
        setRegisteredEmail(data.email);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  // Mostrar mensaje de éxito después del registro
  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-500/20">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">
                ¡Registro Exitoso! 🎉
              </h1>
              <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4 mb-4">
                <p className="text-gray-300 mb-2">
                  Hemos enviado una contraseña temporal a:
                </p>
                <p className="text-purple-400 font-semibold text-lg">
                  {registeredEmail}
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                Revisa tu correo electrónico (incluyendo la carpeta de spam) para obtener tu contraseña temporal.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Próximos pasos:
              </h3>
              <ol className="text-gray-300 text-sm space-y-2 ml-7 list-decimal">
                <li>Revisa tu correo electrónico</li>
                <li>Copia la contraseña temporal</li>
                <li>Inicia sesión con tu correo y la contraseña</li>
                <li>Cambia tu contraseña por una personalizada</li>
              </ol>
            </div>

            {/* Go to Login */}
            <button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-400">Únete a la comunidad gaming</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="player123"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Error general */}
            {registerMutation.isError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">
                  {(() => {
                    const errorMessage = (registerMutation.error as any)?.response?.data?.message || 
                                       'Error al crear la cuenta. Intenta nuevamente.';
                    // Traducir mensajes comunes del inglés al español
                    if (errorMessage === 'El nombre de usuario ya existe') {
                      return 'El nombre de usuario ya existe';
                    }
                    if (errorMessage === 'El correo electrónico ya está registrado') {
                      return 'El correo electrónico ya está registrado';
                    }
                    return errorMessage;
                  })()}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              {registerMutation.isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onBackToLogin}
                className="text-purple-400 hover:text-purple-300 font-semibold transition"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


