import { api } from './api';

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
}

export const labelService = {
  create: async (data: { name: string, color: string, workspaceId: string }) => {
    const response = await api.post('/labels/create', data);
    return response.data.label as Label;
  },

  getByWorkspace: async (workspaceId: string) => {
    const response = await api.get(`/labels/${workspaceId}`);
    return response.data as Label[];
  },

  attachToTask: async (taskId: string, labelId: string) => {
    const response = await api.post('/labels/attach', { taskId, labelId });
    return response.data.task;
  }
};
