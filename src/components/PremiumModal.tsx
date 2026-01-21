import React, { useState } from 'react';
import { X, Crown, Sparkles, Check } from 'lucide-react';
import paymentService from '../services/paymentService';
import { useAuthStore } from '../store/auth';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de actualización a Premium
 * Muestra los beneficios y permite al usuario comprar el acceso premium
 */
const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!user?.id) {
      setError('No se encontró información del jugador');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { sessionUrl } = await paymentService.createCheckoutSession(user.id);
      
      // Redirigir a Stripe Checkout
      paymentService.redirectToCheckout(sessionUrl);
    } catch (err: any) {
      console.error('Error al crear sesión de pago:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  const benefits = [
    'Acceso a todos los niveles (3+)',
    'Logros exclusivos premium',
    'Recompensas mejoradas',
    'Badge premium en tu perfil',
    'Sin anuncios',
    'Soporte prioritario',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-2xl max-w-md w-full shadow-2xl shadow-purple-500/20 animate-scaleIn">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-purple-600 p-4 rounded-full">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            🚀 Hazte Premium
          </h2>
          <p className="text-center text-gray-400 mb-6">
            Desbloquea todo el contenido y funciones exclusivas
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 pb-4">
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Beneficios Premium
            </h3>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Precio */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 mb-6 border border-purple-500/30">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Pago único</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-white">$10.000</span>
                <span className="text-xl text-gray-400">COP</span>
              </div>
              <p className="text-green-400 text-sm mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" />
                ¡Acceso de por vida!
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Botón de compra */}
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 via-purple-600 to-pink-600 hover:from-yellow-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Procesando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Comprar Premium Ahora
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Pago seguro procesado por Stripe 🔒
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
