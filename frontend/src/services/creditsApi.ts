import api from '@/axiosInstance';

export interface CreditsResponse {
  currentBalance: number;
  emailCredits: number;
  verificationCredits: number;
  totalCredits: number;
  creditCosts: {
    emailCostPerCredit: number;
    verificationCostPerCredit: number;
    creditsPerUsd: number;
  };
}

export const creditsApi = {
  // GET /api/credits - Get user credits
  getCredits: async (): Promise<CreditsResponse> => {
    const response = await api.get('/credits');
    return response.data;
  },
};

