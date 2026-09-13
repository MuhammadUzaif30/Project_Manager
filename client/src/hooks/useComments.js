import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, createComment, updateComment, deleteComment } from '../api/comments';

export const useComments = (orgId, projectId, issueId) => {
  return useQuery({
    queryKey: ['comments', orgId, projectId, issueId],
    queryFn: () => fetchComments({ orgId, projectId, issueId }),
    enabled: !!issueId,
  });
};

const useCommentMutation = (mutationFn, orgId, projectId, issueId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', orgId, projectId, issueId] });
    },
  });
};

export const useCreateComment = (orgId, projectId, issueId) =>
  useCommentMutation(
    (content) => createComment({ orgId, projectId, issueId, content }),
    orgId,
    projectId,
    issueId
  );

export const useUpdateComment = (orgId, projectId, issueId) =>
  useCommentMutation(
    ({ commentId, content }) => updateComment({ orgId, projectId, issueId, commentId, content }),
    orgId,
    projectId,
    issueId
  );

export const useDeleteComment = (orgId, projectId, issueId) =>
  useCommentMutation(
    (commentId) => deleteComment({ orgId, projectId, issueId, commentId }),
    orgId,
    projectId,
    issueId
  );