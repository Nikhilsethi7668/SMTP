import api from "../axiosInstance";

export interface ScheduleItem {
  _id: string;
  campaign_id: string;

  name: string;

  start_date?: string | null;
  end_date?: string | null;

  from_time?: string | null;
  to_time?: string | null;
  timezone?: string | null;

  days: string[];

  archived?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ScheduleListResponse {
  success?: boolean;
  count?: number;
  data: ScheduleItem[];
}

export interface ScheduleResponse {
  success?: boolean;
  message?: string;
  data: ScheduleItem;
}

export interface CreateScheduleRequest {
  campaign_id: string;

  name: string;

  start_date?: string | null;
  end_date?: string | null;

  from_time?: string | null;
  to_time?: string | null;
  timezone?: string | null;

  days?: string[];
}

export interface UpdateScheduleRequest {
  name?: string;

  start_date?: string | null;
  end_date?: string | null;

  from_time?: string | null;
  to_time?: string | null;
  timezone?: string | null;

  days?: string[];
  archived?: boolean;
}

export const scheduleApi = {
  // GET /api/schedules?campaign_id=
  getSchedules: async (campaignId?: string): Promise<ScheduleListResponse> => {
    const response = await api.get("/schedules", {
      params: campaignId ? { campaign_id: campaignId } : {},
    });
    return { data: response.data };
  },

  // GET /api/schedules/:id
  getScheduleById: async (id: string): Promise<ScheduleResponse> => {
    const response = await api.get(`/schedules/${id}`);
    return { data: response.data };
  },

  // POST /api/schedules
  createSchedule: async (
    data: CreateScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await api.post("/schedules", data);
    return { data: response.data };
  },

  // PUT /api/schedules/:id
  updateSchedule: async (
    id: string,
    data: UpdateScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await api.put(`/schedules/${id}`, data);
    return { data: response.data };
  },

  // DELETE /api/schedules/:id
  deleteSchedule: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};
