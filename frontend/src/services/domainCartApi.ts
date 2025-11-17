import api from '../axiosInstance';

export interface DomainCartItem {
  _id: string;
  user_id: string;
  domain: string;
  sld: string;
  tld: string;
  available: boolean;
  premium?: boolean;
  registrationPrice: number;
  renewalPrice?: number;
  transferPrice?: number;
  totalPrice: number;
  years: number;
  enomItemNumber?: string;
  enomCartId?: string;
  rrpCode?: string;
  status: 'active' | 'purchased' | 'removed' | 'expired';
  addedAt: string;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainCartResponse {
  success: boolean;
  count: number;
  total: number;
  data: DomainCartItem[];
}

export interface AddToCartRequest {
  domain: string;
  sld: string;
  tld: string;
  years?: number;
  endUserIP?: string;
  // Pricing data from frontend
  registrationPrice?: number;
  renewalPrice?: number;
  transferPrice?: number;
  totalPrice?: number;
  premium?: boolean;
  available?: boolean;
  rrpCode?: string;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  data: DomainCartItem;
}

export interface UpdateCartItemRequest {
  years?: number;
  [key: string]: any;
}

export const domainCartApi = {
  // GET /api/domain-cart
  // Get user's cart items
  getCart: async (): Promise<DomainCartResponse> => {
    const response = await api.get('/domain-cart');
    return response.data;
  },

  // POST /api/domain-cart
  // Add domain to cart
  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await api.post('/domain-cart', data);
    return response.data;
  },

  // PUT /api/domain-cart/:id
  // Update cart item (e.g., change years)
  updateCartItem: async (id: string, data: UpdateCartItemRequest): Promise<AddToCartResponse> => {
    const response = await api.put(`/domain-cart/${id}`, data);
    return response.data;
  },

  // DELETE /api/domain-cart/:id
  // Remove domain from cart by ID
  removeFromCartById: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: DomainCartItem;
  }> => {
    const response = await api.delete(`/domain-cart/${id}`);
    return response.data;
  },

  // DELETE /api/domain-cart
  // Remove domain from cart by domain name
  removeFromCartByDomain: async (domain: string): Promise<{
    success: boolean;
    message: string;
    data: DomainCartItem;
  }> => {
    const response = await api.delete('/domain-cart', { data: { domain } });
    return response.data;
  },

  // DELETE /api/domain-cart/clear/all
  // Clear all items from cart
  clearCart: async (): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> => {
    const response = await api.delete('/domain-cart/clear/all');
    return response.data;
  },
};

