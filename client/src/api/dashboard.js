import axiosClient from './axiosClient';

export const fetchDashboard = async ({ orgId, projectId }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}/dashboard`);
  return res.data;
};