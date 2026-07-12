import { request } from './client';

export const getDashboardSummary = () => {
  return request('/dashboard/summary');
};
