import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard');
  return response.data;
};

export const getPerformanceChart = async () => {
  const response = await api.get('/api/dashboard/performance-chart');
  return response.data;
};
