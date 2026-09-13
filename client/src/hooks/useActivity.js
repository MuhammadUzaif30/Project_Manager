import { useQuery } from '@tanstack/react-query';
import { fetchProjectActivity } from '../api/activity';

export const useProjectActivity = (orgId, projectId) => {
  return useQuery({
    queryKey: ['activity', orgId, projectId],
    queryFn: () => fetchProjectActivity({ orgId, projectId }),
    enabled: !!orgId && !!projectId,
  });
};