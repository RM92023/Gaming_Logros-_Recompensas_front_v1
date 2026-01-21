import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Crown } from 'lucide-react';

/**
 * Página de cancelación de pago
 */
const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al dashboard después de 10 segundos
    const timeout = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-gradient-to-br from-gray-800 via-red-900/20 to-gray-800 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl shadow-red-500/20 animate-scaleIn">
          {/* Icono de cancelación */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-full">
                <XCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-white mb-3">
            Pago Cancelado
          </h1>

          <p className="text-center text-gray-300 mb-6">
            No te preocupes, no se realizó ningún cargo a tu cuenta
          </p>

          {/* Mensaje informativo */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-gray-300 text-sm text-center">
              Puedes intentar nuevamente cuando estés listo. El acceso premium te espera con todos sus beneficios.
            </p>
          </div>

          {/* Recordatorio de beneficios */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-purple-600/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-semibold text-white">Beneficios Premium</span>
            </div>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>🎮 Todos los niveles desbloqueados</li>
              <li>👑 Logros exclusivos</li>
              <li>💰 Recompensas mejoradas</li>
              <li>⭐ Badge premium</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Intentar Nuevamente
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            Serás redirigido automáticamente en 10 segundos...
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            ¿Tienes preguntas? Contáctanos en{' '}
            <a href="mailto:support@gaming.com" className="text-purple-400 hover:text-purple-300">
              support@gaming.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
