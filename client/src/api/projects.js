import axiosClient from './axiosClient';

export const fetchProjects = async (orgId) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects`);
  return res.data.projects;
};

export const createProject = async ({ orgId, name, description }) => {
  const res = await axiosClient.post(`/organizations/${orgId}/projects`, { name, description });
  return res.data.project;
};
export const fetchProject = async ({ orgId, projectId }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}`);
  return res.data.project;
};
export const addProjectMember = async ({ orgId, projectId, userId }) => {
  const res = await axiosClient.post(`/organizations/${orgId}/projects/${projectId}/members`, { userId });
  return res.data.project;
};

export const removeProjectMember = async ({ orgId, projectId, userId }) => {
  const res = await axiosClient.delete(`/organizations/${orgId}/projects/${projectId}/members/${userId}`);
  return res.data.project;
};
export const deleteProject = async ({ orgId, projectId }) => {
  await axiosClient.delete(`/organizations/${orgId}/projects/${projectId}`);
};