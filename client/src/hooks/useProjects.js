import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, fetchProject, addProjectMember, removeProjectMember } from '../api/projects';

const useProjectMemberMutation = (mutationFn, orgId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', orgId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
    },
  });
};

export const useProjects = (orgId) => {
  return useQuery({
    queryKey: ['projects', orgId],
    queryFn: () => fetchProjects(orgId),
    enabled: !!orgId,
  });
};

export const useCreateProject = (orgId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData) => createProject({ orgId, ...projectData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
    },
  });
};
export const useProject = (orgId, projectId) => {
  return useQuery({
    queryKey: ['project', orgId, projectId],
    queryFn: () => fetchProject({ orgId, projectId }),
    enabled: !!orgId && !!projectId,
  });
};
export const useAddProjectMember = (orgId, projectId) =>
  useProjectMemberMutation((userId) => addProjectMember({ orgId, projectId, userId }), orgId, projectId);

export const useRemoveProjectMember = (orgId, projectId) =>
  useProjectMemberMutation((userId) => removeProjectMember({ orgId, projectId, userId }), orgId, projectId);