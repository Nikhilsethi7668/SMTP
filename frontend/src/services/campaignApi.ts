import api from "../axiosInstance";

/* -----------------------------------------
   INTERFACES
----------------------------------------- */

export interface CampaignItem {
  _id: string;
  user_id: string;

  name: string;
  type?: string;

  from_name?: string;
  from_email?: string[]; // ARRAY OF STRINGS (UPDATED)

  reply_to?: string;
  subject?: string;

  send_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  timezone?: string | null;

  ip_pool?: string | null;
  rate_limit?: number | null;
  daily_quota?: number | null;

  status?: string;
  priority?: number | null;
  archived?: boolean;

  delivery_log_collection?: string | null;

  /* NEW FIELDS */
  stop_on_reply?: boolean;
  open_tracking?: boolean;
  send_text_only?: boolean;
  first_email_text_only?: boolean;
  daily_limit?: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  success?: boolean;
  campaigns: CampaignItem[];
}

export interface CampaignResponse {
  success?: boolean;
  campaign: CampaignItem;
}

export interface CreateCampaignRequest {
  name: string;
  type?: string;

  from_name?: string;
  from_email?: string[]; // ARRAY

  reply_to?: string;
  subject?: string;

  send_at?: string | null;
  timezone?: string | null;

  stop_on_reply?: boolean;
  open_tracking?: boolean;
  send_text_only?: boolean;
  first_email_text_only?: boolean;

  daily_limit?: number;
}

export interface UpdateCampaignRequest {
  name?: string;
  type?: string;

  from_name?: string;
  from_email?: string[]; // ARRAY

  reply_to?: string;
  subject?: string;

  send_at?: string | null;
  timezone?: string | null;

  stop_on_reply?: boolean;
  open_tracking?: boolean;
  send_text_only?: boolean;
  first_email_text_only?: boolean;

  daily_limit?: number;
}

/* -----------------------------------------
   API FUNCTIONS
----------------------------------------- */

export const campaignApi = {
  // CREATE campaign
  createCampaign: async (
    data: CreateCampaignRequest
  ): Promise<CampaignResponse> => {
    const response = await api.post("/campaigns", data);
    return response.data;
  },

  // GET all campaigns for logged-in user
  getCampaigns: async (): Promise<CampaignListResponse> => {
    const response = await api.get("/campaigns");
    return response.data;
  },

  // GET names + ids for dropdown
  getCampaignNames: async (): Promise<{
    success: boolean;
    campaigns: { _id: string; name: string }[];
  }> => {
    const response = await api.get("/campaigns/names");
    return response.data;
  },

  // GET single campaign
  getCampaignById: async (id: string): Promise<CampaignResponse> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // UPDATE entire campaign
  updateCampaign: async (
    id: string,
    data: UpdateCampaignRequest
  ): Promise<CampaignResponse> => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  // UPDATE campaign settings only (NEW)
  updateCampaignSettings: async (
    id: string,
    data: UpdateCampaignRequest
  ): Promise<CampaignResponse> => {
    const response = await api.patch(`/campaigns/${id}/settings`, data);
    return response.data;
  },

  // DELETE campaign
  deleteCampaign: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  // UPDATE status (running, paused, draft)
  updateCampaignStatus: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/campaigns/${id}/status`, { status });
    return response.data;
  },

  // INCREMENT campaign metric
  incrementMetric: async (
    id: string,
    metric: string,
    by: number = 1
  ) => {
    const response = await api.post(`/campaigns/${id}/metrics`, {
      metric,
      by,
    });
    return response.data;
  },

  // ARCHIVE campaign
  archiveCampaign: async (id: string, archived: boolean) => {
    const response = await api.post(`/campaigns/${id}/archive`, {
      archived,
    });
    return response.data;
  },

  // GET metrics
  getMetrics: async (campaignId?: string) => {
    const response = await api.get("/campaigns/metrics", {
      params: campaignId ? { campaignId } : {},
    });
    return response.data;
  },
};
