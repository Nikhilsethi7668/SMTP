import api from '../axiosInstance';

export interface DomainSearchResult {
  available: boolean;
  domain: string;
  premium: boolean;
}

export interface DomainSearchResponse {
  success: boolean;
  count: number;
  data: DomainSearchResult[];
}

export interface DomainPricing {
  registrationPrice: number;
  renewalPrice: number;
  transferPrice?: number;
  totalPrice: number;
}

export interface DomainPricingResponse {
  success: boolean;
  data: DomainPricing;
}

export interface DomainCheckResult {
  available: boolean;
  domain: string;
  price?: number;
  premium?: boolean;
  registrationPrice?: number;
  renewalPrice?: number;
  transferPrice?: number;
  rrpCode?: string;
}

export interface DomainCheckResponse {
  success: boolean;
  data: DomainCheckResult;
}

export const purchaseDomainApi = {
  // GET /api/purchase-domains/search?SearchTerm=example
  // Or with additional NameSpinner parameters: /api/purchase-domains/search?SearchTerm=example&MaxResults=50
  searchDomains: async (searchTerm: string, additionalParams?: Record<string, string>): Promise<DomainSearchResponse> => {
    const params = new URLSearchParams({ SearchTerm: searchTerm });
    if (additionalParams) {
      Object.keys(additionalParams).forEach((key) => {
        if (additionalParams[key]) {
          params.append(key, additionalParams[key]);
        }
      });
    }
    const response = await api.get(`/purchase-domains/search?${params.toString()}`);
    return response.data;
  },
  
  // GET /api/purchase-domains/pricing?sld=example&tld=com&years=1
  // Uses check API internally to get pricing
  getDomainPricing: async (sld: string, tld: string, years: number = 1): Promise<DomainPricingResponse> => {
    const params = new URLSearchParams({
      sld,
      tld,
      years: years.toString(),
    });
    const response = await api.get(`/purchase-domains/pricing?${params.toString()}`);
    return response.data;
  },
  
  // GET /api/purchase-domains/check?sld=example&tld=com
  // Uses Enom check command to get availability and pricing
  checkDomain: async (sld: string, tld: string): Promise<DomainCheckResponse> => {
    const params = new URLSearchParams({
      sld,
      tld,
    });
    const response = await api.get(`/purchase-domains/check?${params.toString()}`);
    return response.data;
  },
  
  // POST /api/purchase-domains/add-to-cart
  // Add domain to cart using Enom AddToCart command
  addToCart: async (data: {
    sld: string;
    tld: string;
    endUserIP: string;
    productType?: string;
    quantity?: number;
    clearItems?: boolean;
  }): Promise<{
    success: boolean;
    data: {
      success: boolean;
      cartId?: string;
      message?: string;
      items?: any[];
    };
  }> => {
    const response = await api.post('/purchase-domains/add-to-cart', data);
    return response.data;
  },
  
  // DELETE /api/purchase-domains/delete-from-cart/:itemNumber
  // or DELETE /api/purchase-domains/delete-from-cart with body { itemNumber: "12345" }
  // Delete item from cart using Enom DeleteFromCart command
  deleteFromCart: async (itemNumber: string): Promise<{
    success: boolean;
    data: {
      success: boolean;
      message?: string;
      items?: any[];
    };
  }> => {
    const response = await api.delete(`/purchase-domains/delete-from-cart/${itemNumber}`);
    return response.data;
  },
};

