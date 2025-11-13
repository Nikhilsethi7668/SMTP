import api from '@/axiosInstance';

export interface RegistrantInfo {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  organizationName?: string;
  isDefault?: boolean;
}

export interface RegistrantInfoResponse {
  success: boolean;
  data: RegistrantInfo | null;
  message?: string;
}

export interface RegistrantInfoListResponse {
  success: boolean;
  data: RegistrantInfo[];
  count: number;
}

export const registrantInfoApi = {
  // GET /api/registrant-info - Get default or most recent registrant info
  getRegistrantInfo: async (): Promise<RegistrantInfoResponse> => {
    const response = await api.get('/registrant-info');
    return response.data;
  },

  // GET /api/registrant-info/all - Get all registrant info
  getAllRegistrantInfo: async (): Promise<RegistrantInfoListResponse> => {
    const response = await api.get('/registrant-info/all');
    return response.data;
  },

  // POST /api/registrant-info - Save new registrant info
  saveRegistrantInfo: async (data: RegistrantInfo): Promise<RegistrantInfoResponse> => {
    const response = await api.post('/registrant-info', data);
    return response.data;
  },

  // PUT /api/registrant-info/:id - Update registrant info
  updateRegistrantInfo: async (id: string, data: Partial<RegistrantInfo>): Promise<RegistrantInfoResponse> => {
    const response = await api.put(`/registrant-info/${id}`, data);
    return response.data;
  },

  // DELETE /api/registrant-info/:id - Delete registrant info
  deleteRegistrantInfo: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/registrant-info/${id}`);
    return response.data;
  },

  // PATCH /api/registrant-info/:id/set-default - Set default registrant info
  setDefaultRegistrantInfo: async (id: string): Promise<RegistrantInfoResponse> => {
    const response = await api.patch(`/registrant-info/${id}/set-default`);
    return response.data;
  },
};

