import axiosClient from './axiosClient';

export const fetchProjectActivity = async ({ orgId, projectId }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}/activity`);
  return res.data.activity;
};