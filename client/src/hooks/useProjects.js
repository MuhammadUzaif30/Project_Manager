import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject } from '../api/projects';

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