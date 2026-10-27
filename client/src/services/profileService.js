import api from './api';

export const getProfile = async () => {
  const response = await api.get('/api/profile');
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put('/api/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getUserPosts = async (params = {}) => {
  const response = await api.get('/api/profile/posts', { params });
  return response.data;
};

export const getUserReels = async (params = {}) => {
  const response = await api.get('/api/profile/reels', { params });
  return response.data;
};

export const getPerformanceAnalytics = async () => {
  const response = await api.get('/api/profile/analytics');
  return response.data;
};
