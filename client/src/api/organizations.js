import axiosClient from './axiosClient';

export const fetchMyOrganizations = async () => {
  const res = await axiosClient.get('/organizations');
  return res.data.organizations;
};

export const createOrganization = async (name) => {
  const res = await axiosClient.post('/organizations', { name });
  return res.data.organization;
};