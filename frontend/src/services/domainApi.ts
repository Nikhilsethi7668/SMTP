import api from '../axiosInstance';

export interface IPreWarmedEmail {
  email: string;
  persona: string;
  status: "available" | "warmingup" | "warmingup_failed" | "warmingup_completed";
  provider: "gmail" | "outlook" | "custom";
  price: number;
}
export interface DomainResponse {
  _id: string;
  domain_name: string;
  emails: [];
  dkim_selector: string;
  dkim_public_key?: string;
  dkim_private_key?: string;
  spf_record?: string;
  dmarc_record?: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'disabled';
  last_verified_at?: string;
  status: 'pending' | 'verified' | 'failed' | 'disabled';
  createdAt: string;
  updatedAt: string;
  dnsRecords?: {
    dkim: {
      type: string;
      name: string;
      value: string;
      host: string;
      instructions: string;
    };
    spf: {
      type: string;
      name: string;
      value: string;
      host: string;
      instructions: string;
    };
    dmarc: {
      type: string;
      name: string;
      value: string;
      host: string;
      instructions: string;
    };
  };
}

export interface VerifyDomainResponse {
  message: string;
  verified: boolean;
  domain: DomainResponse;
  verificationResults: {
    dkim: {
      verified: boolean;
      provider: string;
      recordName: string;
      recordValue?: string;
      message?: string;
    };
    spf: {
      verified: boolean;
      provider: string;
      recordName: string;
      recordValue?: string;
      message?: string;
    };
    dmarc: {
      verified: boolean;
      provider: string;
      recordName: string;
      recordValue?: string;
      message?: string;
    };
  };
}

export const domainApi = {
  // GET /api/domains - Get all domains
  getDomains: async (): Promise<DomainResponse[]> => {
    const response = await api.get('/domains');
    return response.data;
  },

  // GET /api/domains/:id - Get domain by ID
  getDomainById: async (id: string): Promise<DomainResponse> => {
    const response = await api.get(`/domains/${id}`);
    return response.data;
  },

  // POST /api/domains - Create domain
  createDomain: async (domain_name: string, dkim_selector?: string): Promise<DomainResponse> => {
    const response = await api.post('/domains', {
      domain_name,
      dkim_selector: dkim_selector || 'email',
    });
    return response.data;
  },

  // DELETE /api/domains/:id - Delete domain
  deleteDomain: async (id: string): Promise<void> => {
    await api.delete(`/domains/${id}`);
  },

  // POST /api/domains/:id/verify - Verify domain
  verifyDomain: async (id: string): Promise<VerifyDomainResponse> => {
    const response = await api.post(`/domains/${id}/verify`);
    return response.data;
  },
};

