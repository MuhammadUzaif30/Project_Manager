import axiosClient from './axiosClient';

export const fetchProjects = async (orgId) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects`);
  return res.data.projects;
};

export const createProject = async ({ orgId, name, description }) => {
  const res = await axiosClient.post(`/organizations/${orgId}/projects`, { name, description });
  return res.data.project;
};