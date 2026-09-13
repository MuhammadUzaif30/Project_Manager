import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard';

export const useDashboard = (orgId, projectId) => {
  return useQuery({
    queryKey: ['dashboard', orgId, projectId],
    queryFn: () => fetchDashboard({ orgId, projectId }),
    enabled: !!orgId && !!projectId,
  });
};