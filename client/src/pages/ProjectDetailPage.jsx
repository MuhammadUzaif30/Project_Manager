import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIssues, useCreateIssue, useProjectLabels } from '../hooks/useIssues';
import IssueCard from '../components/IssueCard';
import IssueFilterBar from '../components/IssueFilterBar';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { useProject, useDeleteProject } from '../hooks/useProjects';
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
  const navigate = useNavigate();

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
  const deleteProjectMutation = useDeleteProject(orgId);
  const { data: availableLabels = [] } = useProjectLabels(orgId, projectId);

  const { data: project } = useProject(orgId, projectId);
  const { data: orgMembers } = useMembers(orgId);

  const myMembership = orgMembers?.find((m) => m.user._id === user?.id);
  const canManage = myMembership?.role === 'Owner' || myMembership?.role === 'Admin';

  const handleCreateIssue = async (payload) => {
    await createIssueMutation.mutateAsync(payload);
    setShowCreateForm(false);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project?.name}"? This will remove all its issues and comments. This cannot be undone.`)) return;
    await deleteProjectMutation.mutateAsync(projectId);
    navigate(`/organizations/${orgId}`);
  };

  if (isLoading) return <div className="text-slate-400 text-sm">Loading issues...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load issues.</div>;

  const { issues, pagination } = data;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
        <Link to={`/organizations/${orgId}`} className="hover:text-indigo-600">← Projects</Link>
        <span>·</span>
        <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`} className="hover:text-indigo-600">
          Dashboard
        </Link>
        <span>·</span>
        <Link to={`/organizations/${orgId}/projects/${projectId}/activity`} className="hover:text-indigo-600">
          Activity
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Issues</h1>

      {project && (
        <ProjectMembersSection
          orgId={orgId}
          projectId={projectId}
          project={project}
          orgMembers={orgMembers}
          canManage={canManage}
        />
      )}

      {canManage && (
        <button
          onClick={handleDeleteProject}
          disabled={deleteProjectMutation.isPending}
          className="px-3 py-1.5 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition mb-4"
        >
          Delete Project
        </button>
      )}

      {showCreateForm ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <IssueForm
            members={project?.members}
            onSubmit={handleCreateIssue}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={createIssueMutation.isPending}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition mb-4"
        >
          + New Issue
        </button>
      )}

      <IssueFilterBar
        filters={filters}
        onChange={setFilters}
        members={project?.members}
        availableLabels={availableLabels}
      />

      {issues.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-500">No issues match your filters.</p>
        </div>
      ) : (
        issues.map((issue) => (
          <Link key={issue._id} to={`/organizations/${orgId}/projects/${projectId}/issues/${issue._id}`}>
            <IssueCard issue={issue} />
          </Link>
        ))
      )}

      <div className="flex items-center justify-center gap-3 mt-4 text-sm">
        <button
          disabled={pagination.page <= 1}
          onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>
        <span className="text-slate-500">
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailPage;