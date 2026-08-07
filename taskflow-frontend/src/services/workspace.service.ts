import { api } from './api';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const workspaceService = {
  getAll: async () => {
    const response = await api.get('/workspaces');
    return response.data as Workspace[];
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data as Workspace;
  },
  
  create: async (data: { name: string }) => {
    const response = await api.post('/workspaces/create', data);
    return response.data as Workspace;
  },
  
  update: async (id: string, data: { name: string }) => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data as Workspace;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  }
};