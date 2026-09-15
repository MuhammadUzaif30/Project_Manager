import axiosClient from './axiosClient';

export const fetchIssues = async ({ orgId, projectId, filters }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}/issues`, {
    params: filters,
  });
  return res.data;
};

export const createIssue = async ({ orgId, projectId, issueData }) => {
  const res = await axiosClient.post(
    `/organizations/${orgId}/projects/${projectId}/issues`,
    issueData
  );
  return res.data.issue;
};

export const updateIssue = async ({ orgId, projectId, issueId, updates }) => {
  const res = await axiosClient.patch(
    `/organizations/${orgId}/projects/${projectId}/issues/${issueId}`,
    updates
  );
  return res.data.issue;
};

export const fetchIssue = async ({ orgId, projectId, issueId }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}`);
  return { ...res.data.issue, myRole: res.data.myRole };
};
export const fetchProjectLabels = async ({ orgId, projectId }) => {
  const res = await axiosClient.get(`/organizations/${orgId}/projects/${projectId}/issues/labels`);
  return res.data.labels;
};
export const deleteIssue = async ({ orgId, projectId, issueId }) => {
  await axiosClient.delete(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}`);
};