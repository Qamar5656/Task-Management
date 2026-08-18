import { api } from './api';

export const userService = {
  updateProfile: async (data: { name: string }) => {
    const response = await api.put('/user/me', data);
    return response.data;
  },

  updatePassword: async (data: { currentPassword: string, newPassword: string }) => {
    const response = await api.put('/user/me/password', data);
    return response.data;
  }
};
