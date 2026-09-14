import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyOrganizations, createOrganization, fetchMembers, addMember, removeMember, changeMemberRole } from '../api/organizations';

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
export const useMembers = (orgId) => {
  return useQuery({
    queryKey: ['members', orgId],
    queryFn: () => fetchMembers(orgId),
    enabled: !!orgId,
  });
};

const useMemberMutation = (mutationFn, orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
    },
  });
};

export const useAddMember = (orgId) =>
  useMemberMutation(({ email, role }) => addMember({ orgId, email, role }), orgId);

export const useRemoveMember = (orgId) =>
  useMemberMutation((userId) => removeMember({ orgId, userId }), orgId);

export const useChangeMemberRole = (orgId) =>
  useMemberMutation(({ userId, role }) => changeMemberRole({ orgId, userId, role }), orgId);