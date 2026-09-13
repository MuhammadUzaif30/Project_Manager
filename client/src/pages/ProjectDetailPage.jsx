import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIssues, useCreateIssue } from '../hooks/useIssues';
import IssueCard from '../components/IssueCard';
import IssueFilterBar from '../components/IssueFilterBar';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../hooks/useProjects';
import IssueForm from '../components/IssueForm';
import { useMembers } from '../hooks/useOrganizations';
import ProjectMembersSection from '../components/ProjectMembersSection';
import { useAuth } from '../context/AuthContext';

const ProjectDetailPage = () => {
  const { orgId, projectId } = useParams();
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
  
  const { data: project } = useProject(orgId, projectId);
  const { data: orgMembers } = useMembers(orgId);
  
  // Calculate if the current user has permission to manage members
  const myMembership = orgMembers?.find((m) => m.user._id === user.id);
  const canManage = myMembership?.role === 'Owner' || myMembership?.role === 'Admin';

  const handleCreateIssue = async (payload) => {
    await createIssueMutation.mutateAsync(payload);
    setShowCreateForm(false);
  };

  if (isLoading) return <div>Loading issues...</div>;
  if (isError) return <div>Failed to load issues.</div>;

  const { issues, pagination } = data;
  
  // This extracts all unique labels from the currently loaded issues
  const availableLabels = [...new Set((issues || []).flatMap((issue) => issue.labels || []))];

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h1>Issues</h1>
        <Link to={`/organizations/${orgId}`}>← Back to projects</Link>
        {' · '}
        <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>Dashboard</Link>
        {' · '}
        <Link to={`/organizations/${orgId}/projects/${projectId}/activity`}>Activity</Link>
      {/* Project Members Section renders here once the project data has loaded */}
      {project && (
        <ProjectMembersSection
          orgId={orgId}
          projectId={projectId}
          project={project}
          orgMembers={orgMembers}
          canManage={canManage}
        />
      )}

      {showCreateForm ? (
        <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <IssueForm
            members={project?.members}
            onSubmit={handleCreateIssue}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={createIssueMutation.isPending}
          />
        </div>
      ) : (
        <button onClick={() => setShowCreateForm(true)} style={{ marginBottom: 16 }}>
          + New Issue
        </button>
      )}

      {/* Passing the project members and computed labels to the filter bar */}
      <IssueFilterBar 
        filters={filters} 
        onChange={setFilters} 
        members={project?.members}
        availableLabels={availableLabels}
      />

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