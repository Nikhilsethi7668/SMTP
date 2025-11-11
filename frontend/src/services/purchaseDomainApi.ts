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
  sld: string;
  tld: string;
  years: number;
  registrationPrice: number;
  renewalPrice: number;
  totalPrice: number;
  currency: string;
}

export const purchaseDomainApi = {
  // GET /api/purchase-domains/search?keyword=example&tlds=com,net,org
  searchDomains: async (keyword: string, tlds?: string[]): Promise<DomainSearchResponse> => {
    const params = new URLSearchParams({ keyword });
    if (tlds && tlds.length > 0) {
      params.append('tlds', tlds.join(','));
    }
    const response = await api.get(`/purchase-domains/search?${params.toString()}`);
    return response.data;
  },
};

