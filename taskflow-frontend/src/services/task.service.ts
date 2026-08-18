import { api } from './api';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  startDate: string | null;
  dueDate: string | null;
  estimate: number | null;
  labels: { id: string; name: string; color: string }[];
  user?: { id: string; name: string | null; email: string };
  project?: {
    id: string;
    name: string;
    workspace?: {
      id: string;
      name: string;
    };
  };
  userId: string;
  name: string;
  description?: string;
  slug: string;
  status: TaskStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  estimate?: number;
  position?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  projectId: string;
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  userId?: string; // Assignee
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  userId?: string;
}

export const taskService = {
  create: async (data: CreateTaskData) => {
    const response = await api.post<{ message: string, task: Task }>('/tasks/create', data);
    return response.data.task;
  },

  getByProject: async (projectId: string) => {
    const response = await api.get<Task[]>(`/tasks?projectId=${projectId}`);
    return response.data;
  },

  getMyTasks: async () => {
    const response = await api.get<Task[]>('/tasks/my/all');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskData) => {
    const response = await api.put<{ message: string, task: Task }>(`/tasks/${id}`, data);
    return response.data.task;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  }
};
