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

export interface PurchasedDomain {
  _id: string;
  domain: string;
  sld: string;
  tld: string;
  orderId?: string;
  purchaseStatus: 'pending' | 'active' | 'failed' | 'expired';
  years?: number;
  expirationDate?: string;
  purchaseDate?: string;
  price?: number;
  dkim_selector?: string;
  dkim_public_key?: string;
  spf_record?: string;
  dmarc_record?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed' | 'disabled';
  registrantInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    organizationName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchasedDomainsResponse {
  success: boolean;
  count: number;
  data: PurchasedDomain[];
}

export interface PurchasedDomainStatusResponse {
  success: boolean;
  data: {
    domain: PurchasedDomain;
    registrationStatus: {
      registered: boolean;
      status?: string;
      expirationDate?: string;
    };
  };
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

  // GET /api/purchase-domains/my-domains - list purchased domains
  getMyPurchasedDomains: async (): Promise<PurchasedDomain[]> => {
    const response = await api.get<PurchasedDomainsResponse>('/purchase-domains/my-domains');
    return response.data.data;
  },

  // POST /api/purchase-domains/my-domains/:id/check-status - check registration status
  checkPurchasedDomainStatus: async (id: string): Promise<PurchasedDomainStatusResponse> => {
    const response = await api.post<PurchasedDomainStatusResponse>(`/purchase-domains/my-domains/${id}/check-status`);
    return response.data;
  },

  // POST /api/purchase-domains/my-domains/:id/set-dns - set DNS records for purchased domain
  setPurchasedDomainDNS: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: {
      domain: string;
      recordsSet: number;
      result: any;
    };
  }> => {
    const response = await api.post(`/purchase-domains/my-domains/${id}/set-dns`);
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

