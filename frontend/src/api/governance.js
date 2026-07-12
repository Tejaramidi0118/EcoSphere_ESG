import { request } from './client';

export const governanceApi = {
  getPolicies: () => request('/governance/policies'),
  createPolicy: (data) => request('/governance/policies', { method: 'POST', body: JSON.stringify(data) }),
  acknowledgePolicy: (id) => request(`/governance/policies/${id}/acknowledge`, { method: 'POST' }),
  getAcknowledgements: (id) => request(`/governance/policies/${id}/acknowledgements`),

  getAudits: () => request('/governance/audits'),
  createAudit: (data) => request('/governance/audits', { method: 'POST', body: JSON.stringify(data) }),

  getComplianceIssues: () => request('/governance/compliance-issues'),
  createComplianceIssue: (data) => request('/governance/compliance-issues', { method: 'POST', body: JSON.stringify(data) }),
  updateComplianceIssue: (id, status) => request(`/governance/compliance-issues/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
};
