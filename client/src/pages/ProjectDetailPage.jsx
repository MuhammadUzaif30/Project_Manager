import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIssues, useCreateIssue } from '../hooks/useIssues';
import IssueCard from '../components/IssueCard';
import IssueFilterBar from '../components/IssueFilterBar';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';

const ProjectDetailPage = () => {
  const { orgId, projectId } = useParams();
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinProject', projectId);

    const handleIssueEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['issues', orgId, projectId] });
    };

    socket.on('issue:created', handleIssueEvent);
    socket.on('issue:updated', handleIssueEvent);
    socket.on('issue:deleted', handleIssueEvent);

    return () => {
      socket.emit('leaveProject', projectId);
      socket.off('issue:created', handleIssueEvent);
      socket.off('issue:updated', handleIssueEvent);
      socket.off('issue:deleted', handleIssueEvent);
    };
  }, [socket, projectId, orgId, queryClient]);
  const { data, isLoading, isError } = useIssues(orgId, projectId, filters);
  const createIssueMutation = useCreateIssue(orgId, projectId);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;
    await createIssueMutation.mutateAsync({ title: newIssueTitle });
    setNewIssueTitle('');
  };

  if (isLoading) return <div>Loading issues...</div>;
  if (isError) return <div>Failed to load issues.</div>;

  const { issues, pagination } = data;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Link to={`/organizations/${orgId}`}>← Back to projects</Link>
      <h1>Issues</h1>
        <Link to={`/organizations/${orgId}`}>← Back to projects</Link>
        {' · '}
        <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>Dashboard</Link>
      <form onSubmit={handleCreateIssue} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="New issue title"
          value={newIssueTitle}
          onChange={(e) => setNewIssueTitle(e.target.value)}
        />
        <button type="submit" disabled={createIssueMutation.isPending}>
          {createIssueMutation.isPending ? 'Creating...' : 'Create Issue'}
        </button>
      </form>

      <IssueFilterBar filters={filters} onChange={setFilters} />

      {issues.length === 0 ? (
        <p>No issues match your filters.</p>
      ) : (
        issues.map((issue) => (
          <Link key={issue._id} to={`/organizations/${orgId}/projects/${projectId}/issues/${issue._id}`}>
            <IssueCard issue={issue} />
          </Link>
        ))
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          disabled={pagination.page <= 1}
          onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailPage;