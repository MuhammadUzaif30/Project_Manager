import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyOrganizations, createOrganization } from '../api/organizations';

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchMyOrganizations,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};