import { api } from './api';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
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
  },

  getMembers: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data as WorkspaceMember[];
  },

  addMember: async (workspaceId: string, email: string, role: WorkspaceRole) => {
    const response = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
    return response.data as WorkspaceMember;
  },

  removeMember: async (workspaceId: string, userId: string) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  }
};