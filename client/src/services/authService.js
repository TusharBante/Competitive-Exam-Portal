import api from './api';

export const register = async (data) => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await api.put('/api/auth/password', data);
  return response.data;
};
