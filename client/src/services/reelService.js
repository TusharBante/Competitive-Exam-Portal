import api from './api';

export const getReels = async (params = {}) => {
  const response = await api.get('/api/reels', { params });
  return response.data;
};

export const createReel = async (formData) => {
  const response = await api.post('/api/reels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getReelById = async (id) => {
  const response = await api.get(`/api/reels/${id}`);
  return response.data;
};

export const updateReel = async (id, data) => {
  const response = await api.put(`/api/reels/${id}`, data);
  return response.data;
};

export const deleteReel = async (id) => {
  const response = await api.delete(`/api/reels/${id}`);
  return response.data;
};

export const toggleLike = async (id) => {
  const response = await api.post(`/api/reels/${id}/like`);
  return response.data;
};

export const addComment = async (id, content) => {
  const response = await api.post(`/api/reels/${id}/comments`, { content });
  return response.data;
};

export const deleteComment = async (reelId, commentId) => {
  const response = await api.delete(`/api/reels/${reelId}/comments/${commentId}`);
  return response.data;
};

export const toggleSave = async (id) => {
  const response = await api.post(`/api/reels/${id}/save`);
  return response.data;
};

export const getSavedReels = async () => {
  const response = await api.get('/api/reels/saved');
  return response.data;
};

export const shareReel = async (id) => {
  const response = await api.get(`/api/reels/${id}/share`);
  return response.data;
};
