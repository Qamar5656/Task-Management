import { api } from './api';

export interface Project {
  id: string;
  name: string;
  slug: string;
  workspaceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  getAllByWorkspace: async (workspaceId: string) => {
    const response = await api.get(`/projects/getProjects?workspaceId=${workspaceId}`);
    return response.data as Project[];
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data as Project;
  },
  
  create: async (data: { name: string; workspaceId: string }) => {
    const response = await api.post('/projects/create', data);
    return response.data as Project;
  },
  
  update: async (id: string, data: { name: string }) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data as Project;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};
