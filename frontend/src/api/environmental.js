import { request } from './client';

export const getEmissionFactors = () => {
  return request('/environmental/emission-factors');
};

export const getCarbonTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/environmental/carbon-transactions?${query}`);
};

export const createCarbonTransaction = (data) => {
  return request('/environmental/carbon-transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getGoals = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/environmental/goals?${query}`);
};

export const createGoal = (data) => {
  return request('/environmental/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateGoal = (id, data) => {
  return request(`/environmental/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteGoal = (id) => {
  return request(`/environmental/goals/${id}`, {
    method: 'DELETE',
  });
};
