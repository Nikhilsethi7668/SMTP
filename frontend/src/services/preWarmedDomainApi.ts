import api from '../axiosInstance';

export interface PreWarmedEmail {
  email: string;
  persona: string;
  provider: "gmail" | "outlook" | "custom";
  price: number;
}

export interface PreWarmedDomain {
  _id: string;
  domain: string;
  emails: PreWarmedEmail[];
  forwarding?: string;
  userId?: {
    _id: string;
    email?: string;
    full_name?: string;
    username?: string;
  };
  domainPrice: number;
  emailPrice: number;
  status: "available" | "reserved" | "purchased";
  warmingup?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchasedDomainsResponse {
  success: boolean;
  count: number;
  data: PreWarmedDomain[];
}

export interface DomainResponse {
  success: boolean;
  data: PreWarmedDomain;
}

export const preWarmedDomainApi = {
  // GET /api/pre-warmed-domains/purchased - Get all purchased domains
  getAllPurchasedDomains: async (search?: string): Promise<PreWarmedDomain[]> => {
    const response = await api.get<PurchasedDomainsResponse>('/pre-warmed-domains/purchased', {
      params: search ? { search } : {},
    });
    return response.data.data;
  },
  
  // GET /api/pre-warmed-domains/all - Get all domains (admin)
  getAllDomains: async (search?: string): Promise<PreWarmedDomain[]> => {
    const response = await api.get<PurchasedDomainsResponse>('/pre-warmed-domains/all', {
      params: search ? { search } : {},
    });
    return response.data.data;
  },
  
  // GET /api/pre-warmed-domains/id/:id - Get domain by ID
  getDomainById: async (id: string): Promise<PreWarmedDomain> => {
    const response = await api.get<DomainResponse>(`/pre-warmed-domains/id/${id}`);
    return response.data.data;
  },
  
  // PATCH /api/pre-warmed-domains/:id/warmup - Toggle warmup for a domain
  toggleDomainWarmup: async (id: string, warmingup: boolean): Promise<PreWarmedDomain> => {
    const response = await api.patch<DomainResponse>(`/pre-warmed-domains/${id}/warmup`, {
      warmingup,
    });
    return response.data.data;
  },
};

