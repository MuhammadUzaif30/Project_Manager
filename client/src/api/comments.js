import axiosClient from './axiosClient';

export const fetchComments = async ({ orgId, projectId, issueId }) => {
  const res = await axiosClient.get(
    `/organizations/${orgId}/projects/${projectId}/issues/${issueId}/comments`
  );
  return res.data.comments;
};

export const createComment = async ({ orgId, projectId, issueId, content }) => {
  const res = await axiosClient.post(
    `/organizations/${orgId}/projects/${projectId}/issues/${issueId}/comments`,
    { content }
  );
  return res.data.comment;
};

export const updateComment = async ({ orgId, projectId, issueId, commentId, content }) => {
  const res = await axiosClient.patch(
    `/organizations/${orgId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    { content }
  );
  return res.data.comment;
};

export const deleteComment = async ({ orgId, projectId, issueId, commentId }) => {
  await axiosClient.delete(
    `/organizations/${orgId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`
  );
};