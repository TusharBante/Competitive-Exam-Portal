import api from './api';

export const getPosts = async (params = {}) => {
  const response = await api.get('/api/posts', { params });
  return response.data;
};

export const createPost = async (formData) => {
  const response = await api.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/api/posts/${id}`);
  return response.data;
};

export const updatePost = async (id, formData) => {
  const response = await api.put(`/api/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/api/posts/${id}`);
  return response.data;
};

export const toggleLike = async (id) => {
  const response = await api.post(`/api/posts/${id}/like`);
  return response.data;
};

export const addComment = async (id, content) => {
  const response = await api.post(`/api/posts/${id}/comments`, { content });
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await api.delete(`/api/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const toggleSave = async (id) => {
  const response = await api.post(`/api/posts/${id}/save`);
  return response.data;
};

export const getSavedPosts = async () => {
  const response = await api.get('/api/posts/saved');
  return response.data;
};
