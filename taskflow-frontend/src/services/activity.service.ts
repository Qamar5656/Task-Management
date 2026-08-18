import { api } from './api';

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export const activityService = {
  getRecentActivities: async (limit: number = 20) => {
    const response = await api.get(`/activities?limit=${limit}`);
    return response.data as ActivityLog[];
  }
};
