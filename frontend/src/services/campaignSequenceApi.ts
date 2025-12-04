import api from "../axiosInstance";

// ---------- Types ----------
export interface SequenceVariant {
  _id: string;
  step_id: string;
  campaign_id: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface SequenceStep {
  _id: string;
  campaign_id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  variants?: SequenceVariant[];
}

// ---------- API ----------
export const campaignSequenceApi = {
  // GET steps of a campaign
  getSteps: async (
    campaign_id: string
  ): Promise<{ success: boolean; steps: SequenceStep[] }> => {
    const res = await api.get(`/sequences/steps/${campaign_id}`);
    return res.data;
  },

  // POST create step
  createStep: async (data: {
    campaign_id: string;
    name: string;
    order: number;
  }): Promise<{ success: boolean; step: SequenceStep }> => {
    const res = await api.post("/sequences/steps", data);
    return res.data;
  },

  // PUT update step
  updateStep: async (
    step_id: string,
    data: Partial<{ name: string; order: number }>
  ): Promise<{ success: boolean; step: SequenceStep }> => {
    const res = await api.put(`/sequences/steps/${step_id}`, data);
    return res.data;
  },

  // DELETE step
  deleteStep: async (
    step_id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/sequences/steps/${step_id}`);
    return res.data;
  },

  // ---------- VARIANTS ----------
  // GET variants of a specific step
  getVariants: async (
    step_id: string
  ): Promise<{ success: boolean; variants: SequenceVariant[] }> => {
    const res = await api.get(`/sequences/variants/${step_id}`);
    return res.data;
  },

  // POST create variant
  createVariant: async (data: {
    step_id: string;
    campaign_id: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean; variant: SequenceVariant }> => {
    const res = await api.post("/sequences/variants", data);
    return res.data;
  },

  // PUT update variant subject/body
  updateVariant: async (
    variant_id: string,
    data: Partial<{ subject: string; body: string }>
  ): Promise<{ success: boolean; variant: SequenceVariant }> => {
    const res = await api.put(`/sequences/variants/${variant_id}`, data);
    return res.data;
  },

  // DELETE variant
  deleteVariant: async (
    variant_id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/sequences/variants/${variant_id}`);
    return res.data;
  },

  // ---------- TEST EMAIL ----------
  testVariantEmail: async (
    variant_id: string,
    from: string,
    to: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    const res = await api.post(`/sequences/variants/${variant_id}/test`, {
      from,
      to,
    });
    return res.data;
  },
};
