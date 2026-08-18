import { api } from './api';

export interface DashboardStats {
  totalWorkspaces: number;
  activeProjects: number;
  tasksCompleted: number;
  upcomingDeadlines: number;
}

export const dashboardService = {
  getOverviewStats: async () => {
    const response = await api.get<{ message: string, stats: DashboardStats }>('/dashboard/stats');
    return response.data.stats;
  }
};
