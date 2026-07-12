import { request } from './client';

export const gamificationApi = {
  getChallenges: (status = '') => request(`/gamification/challenges${status ? `?status=${status}` : ''}`),
  createChallenge: (data) => request('/gamification/challenges', { method: 'POST', body: JSON.stringify(data) }),
  updateChallengeStatus: (id, status) => request(`/gamification/challenges/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  
  joinChallenge: (data) => request('/gamification/challenge-participation', { method: 'POST', body: JSON.stringify(data) }),
  getMyParticipations: () => request('/gamification/challenge-participation/my'),
  submitChallengeProof: (id, proofUrl) => request(`/gamification/challenge-participation/${id}/submit`, { method: 'PUT', body: JSON.stringify({ proofUrl }) }),
  getPendingParticipations: () => request('/gamification/challenge-participation/pending'),
  approveChallengeParticipation: (id, status = 'Approved') => request(`/gamification/challenge-participation/${id}/approve`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getBadges: () => request('/gamification/badges'),
  getMyBadges: () => request('/gamification/my-badges'),

  getRewards: () => request('/gamification/rewards'),
  redeemReward: (id) => request(`/gamification/rewards/${id}/redeem`, { method: 'POST' }),

  getLeaderboard: (scope) => request(`/gamification/leaderboard?scope=${scope}`)
};
