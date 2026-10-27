import api from './api';

export const getTests = async (params = {}) => {
  const response = await api.get('/api/tests', { params });
  return response.data;
};

export const getTestById = async (id) => {
  const response = await api.get(`/api/tests/${id}`);
  return response.data;
};

export const startTest = async (id) => {
  const response = await api.post(`/api/tests/${id}/start`);
  return response.data;
};

export const submitTest = async (attemptId, answers) => {
  const response = await api.post(`/api/tests/attempts/${attemptId}/submit`, { answers });
  return response.data;
};

export const getAttemptResult = async (attemptId) => {
  const response = await api.get(`/api/tests/attempts/${attemptId}/result`);
  return response.data;
};

export const getTestHistory = async (params = {}) => {
  const response = await api.get('/api/tests/history', { params });
  return response.data;
};
