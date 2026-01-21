import api from '../lib/api';

export interface PremiumStatus {
  isPremium: boolean;
  purchasedAt: string | null;
}

export interface PurchaseHistory {
  id: string;
  playerId: string;
  stripePaymentId: string;
  stripeCheckoutSessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  sessionUrl: string;
}

/**
 * Servicio para gestionar pagos y estado premium
 */
class PaymentService {
  /**
   * Crea una sesión de checkout de Stripe
   */
  async createCheckoutSession(playerId: string): Promise<CheckoutSession> {
    const response = await api.post('/payments/create-checkout', {
      playerId,
      successUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
    });
    return response.data.data;
  }

  /**
   * Verifica si un jugador tiene premium
   */
  async checkPremiumStatus(playerId: string): Promise<PremiumStatus> {
    const response = await api.get(`/payments/premium-status/${playerId}`);
    return response.data.data;
  }

  /**
   * Obtiene el historial de compras de un jugador
   */
  async getPurchaseHistory(playerId: string): Promise<PurchaseHistory[]> {
    const response = await api.get(`/payments/purchase-history/${playerId}`);
    return response.data.data;
  }

  /**
   * Redirige al usuario a Stripe Checkout
   */
  redirectToCheckout(sessionUrl: string): void {
    window.location.href = sessionUrl;
  }
}

export default new PaymentService();
