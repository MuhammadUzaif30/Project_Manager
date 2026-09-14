import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchIssues, createIssue, updateIssue,  fetchProjectLabels } from '../api/issues';

export const useIssues = (orgId, projectId, filters) => {
  return useQuery({
    queryKey: ['issues', orgId, projectId, filters],
    queryFn: () => fetchIssues({ orgId, projectId, filters }),
    enabled: !!orgId && !!projectId,
    keepPreviousData: true,
  });
};
export const useIssue = (orgId, projectId, issueId) => {
  return useQuery({
    queryKey: ['issue', orgId, projectId, issueId],
    queryFn: () => fetchIssue({ orgId, projectId, issueId }),
    enabled: !!orgId && !!projectId && !!issueId,
  });
};
export const useCreateIssue = (orgId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueData) => createIssue({ orgId, projectId, issueData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', orgId, projectId] });
    },
  });
};

export const useUpdateIssue = (orgId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, updates }) => updateIssue({ orgId, projectId, issueId, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', orgId, projectId] });
    },
  });
};
export const useProjectLabels = (orgId, projectId) => {
  return useQuery({
    queryKey: ['issueLabels', orgId, projectId],
    queryFn: () => fetchProjectLabels({ orgId, projectId }),
    enabled: !!orgId && !!projectId,
  });
};