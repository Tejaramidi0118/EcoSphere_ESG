import { request } from './client';

export const settingsApi = {
  getEsgConfig: () => request('/settings/esg-config'),
  updateEsgConfig: (data) => request('/settings/esg-config', { method: 'PUT', body: JSON.stringify(data) }),
  getDepartments: () => request('/settings/departments'),
  getCategories: (type = '') => request(`/settings/categories${type ? `?type=${type}` : ''}`)
};
