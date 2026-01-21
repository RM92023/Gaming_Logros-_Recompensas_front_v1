import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, Crown } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth.service';

/**
 * Página de éxito después de completar el pago
 */
const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Refrescar datos del usuario para obtener el estado premium actualizado
    const refreshUserData = async () => {
      if (user?.id) {
        try {
          const updatedUser = await authService.getProfile(user.id);
          setUser(updatedUser);
        } catch (error) {
          console.error('Error al actualizar datos del usuario:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshUserData();

    // Redirigir al dashboard después de 5 segundos
    const timeout = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate, user?.id, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-gradient-to-br from-gray-800 via-purple-900/30 to-gray-800 border-2 border-green-500/50 rounded-2xl p-8 shadow-2xl shadow-green-500/20 animate-scaleIn">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-white mb-3">
            ¡Pago Exitoso! 🎉
          </h1>

          <p className="text-center text-gray-300 mb-6">
            Tu compra se ha procesado correctamente
          </p>

          {/* Mensaje Premium */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-purple-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold text-white">
                {isRefreshing ? 'Actualizando cuenta...' : '¡Ahora eres Premium!'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              {isRefreshing 
                ? 'Estamos activando tus beneficios premium...'
                : 'Disfruta de acceso completo a todos los niveles y funciones exclusivas.'
              }
            </p>
          </div>

          {/* Beneficios desbloqueados */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Desbloqueaste:
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>✅ Acceso a todos los niveles</li>
              <li>✅ Logros exclusivos premium</li>
              <li>✅ Recompensas mejoradas</li>
              <li>✅ Badge premium en tu perfil</li>
            </ul>
          </div>

          {/* Botón para continuar */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
          >
            Ir al Dashboard
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:support@gaming.com" className="text-purple-400 hover:text-purple-300">
              support@gaming.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
