import { request } from './client';

export const socialApi = {
  getActivities: () => request('/social/csr-activities'),
  getActivityById: (id) => request(`/social/csr-activities/${id}`),
  createActivity: (data) => request('/social/csr-activities', { method: 'POST', body: JSON.stringify(data) }),
  
  logParticipation: (data) => request('/social/participation', { method: 'POST', body: JSON.stringify(data) }),
  getPendingParticipation: () => request('/social/participation?status=Pending'),
  
  approveParticipation: (id) => request(`/social/participation/${id}/approve`, { method: 'PUT' }),
  rejectParticipation: (id) => request(`/social/participation/${id}/reject`, { method: 'PUT' }),
};
