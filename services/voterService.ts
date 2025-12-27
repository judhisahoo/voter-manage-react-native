import { apiClient } from './secureAxios';

export interface Voter {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
}

export interface VoterListResponse {
  data?: Voter[];
  voters?: Voter[];
}

class VoterService {
  async getAllVoters(query?: Record<string, any>): Promise<Voter[]> {
    try {
      let qs = '';
      if (query) {
        const params = new URLSearchParams();
        Object.keys(query).forEach((k) => {
          if (query[k] !== undefined && query[k] !== null) params.append(k, String(query[k]));
        });
        qs = params.toString() ? `?${params.toString()}` : '';
      }

      const response = await apiClient.get<Voter[] | VoterListResponse>(`/voter-data${qs}`);

      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        const obj = response as VoterListResponse;
        return obj.data || obj.voters || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching voters:', error);
      throw error;
    }
  }

  async updateVoterStatus(id: string, status: 'active' | 'inactive' | 'blocked') {
    try {
      const response = await apiClient.patch(`/voters/${id}/status`, { status });

      
      return response;
    } catch (error) {
      console.error('Error updating voter status:', error);
      throw error;
    }
  }

  async getVoterById(id: string) {
    try {
      const response = await apiClient.get(`/voter-data/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching voter by id:', error);
      throw error;
    }
  }

  async deleteVoter(id: string) {
    try {
      await apiClient.delete(`/voter-data/${id}`);
    } catch (error) {
      console.error('Error deleting voter:', error);
      throw error;
    }
  }

  async enableVoter(epicNo: string) {
    try {
      const response = await apiClient.post(`/voter-data/enable/${epicNo}`, { epic_no: epicNo });
      return response;
    } catch (error) {
      console.error('Error enabling voter:', error);
      throw error;
    }
  }

  async disableVoter(epicNo: string) {
    try {
      const response = await apiClient.post(`/voter-data/disable/${epicNo}`, { epic_no: epicNo });
      return response;
    } catch (error) {
      console.error('Error disabling voter:', error);
      throw error;
    }
  }
}

export const voterService = new VoterService();
