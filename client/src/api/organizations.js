import axiosClient from './axiosClient';

export const fetchMyOrganizations = async () => {
  const res = await axiosClient.get('/organizations');
  return res.data.organizations;
};

export const createOrganization = async (name) => {
  const res = await axiosClient.post('/organizations', { name });
  return res.data.organization;
};
export const fetchMembers = async (orgId) => {
  const res = await axiosClient.get(`/organizations/${orgId}/members`);
  return res.data.members;
};

export const addMember = async ({ orgId, email, role }) => {
  const res = await axiosClient.post(`/organizations/${orgId}/members`, { email, role });
  return res.data.membership;
};

export const removeMember = async ({ orgId, userId }) => {
  await axiosClient.delete(`/organizations/${orgId}/members/${userId}`);
};

export const changeMemberRole = async ({ orgId, userId, role }) => {
  const res = await axiosClient.patch(`/organizations/${orgId}/members/${userId}/role`, { role });
  return res.data.membership;
};