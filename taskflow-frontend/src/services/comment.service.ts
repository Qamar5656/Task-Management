import { api } from './api';
import type { TaskComment } from './task.service';

export const commentService = {
  create: async (taskId: string, content: string) => {
    const response = await api.post<{ message: string, comment: TaskComment }>('/comment/create', { taskId, content });
    return response.data.comment;
  },

  getByTask: async (taskId: string) => {
    const response = await api.get<{ message: string, comments: TaskComment[] }>(`/comment/task/${taskId}`);
    return response.data.comments;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/comment/${id}`);
    return response.data;
  }
};
