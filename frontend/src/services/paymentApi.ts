import api from '@/axiosInstance';

export interface CreateCheckoutSessionRequest {
  amount: number;
  currency?: 'usd' | 'inr';
}

export interface CreateCheckoutSessionResponse {
  id: string; // Stripe session ID
}

export const paymentApi = {
  // POST /api/payment/create-checkout-session - Create Stripe checkout session
  createCheckoutSession: async (
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await api.post('/payment/create-checkout-session', data);
    return response.data;
  },
};

