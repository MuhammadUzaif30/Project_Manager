import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIssue, useUpdateIssue } from '../hooks/useIssues';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../hooks/useComments';
import { useProjectActivity } from '../hooks/useActivity';
import CommentItem from '../components/CommentItem';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../hooks/useProjects';
import IssueForm from '../components/IssueForm';
import { StatusBadge, PriorityBadge } from '../components/Badges';

const IssueDetailPage = () => {
  const { orgId, projectId, issueId } = useParams();
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinProject', projectId);

    const handleIssueUpdate = (updatedIssue) => {
      if (updatedIssue._id === issueId) {
        queryClient.invalidateQueries({ queryKey: ['issue', orgId, projectId, issueId] });
      }
    };

    const handleCommentCreated = (comment) => {
      if (comment.issue === issueId) {
        queryClient.invalidateQueries({ queryKey: ['comments', orgId, projectId, issueId] });
      }
    };

    socket.on('issue:updated', handleIssueUpdate);
    socket.on('comment:created', handleCommentCreated);

    return () => {
      socket.off('issue:updated', handleIssueUpdate);
      socket.off('comment:created', handleCommentCreated);
    };
  }, [socket, projectId, orgId, issueId, queryClient]);

  const { data: issue, isLoading: issueLoading, isError: issueError } = useIssue(orgId, projectId, issueId);
  const { data: comments, isLoading: commentsLoading } = useComments(orgId, projectId, issueId);
  const { data: allActivity } = useProjectActivity(orgId, projectId);
  const { data: project } = useProject(orgId, projectId);

  const updateIssueMutation = useUpdateIssue(orgId, projectId);
  const createCommentMutation = useCreateComment(orgId, projectId, issueId);
  const updateCommentMutation = useUpdateComment(orgId, projectId, issueId);
  const deleteCommentMutation = useDeleteComment(orgId, projectId, issueId);

  if (issueLoading) return <div className="text-slate-400 text-sm">Loading issue...</div>;
  if (issueError) return <div className="text-red-600 text-sm">Failed to load issue.</div>;

  const issueActivity = (allActivity || []).filter((a) => a.targetId === issueId);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment, { onSuccess: () => setNewComment('') });
  };
  const handleCommentUpdated = (comment) => {
  if (comment.issue === issueId) {
    queryClient.invalidateQueries({ queryKey: ['comments', orgId, projectId, issueId] });
  }
};

const handleCommentDeleted = (data) => {
  if (data.issueId === issueId) {
    queryClient.invalidateQueries({ queryKey: ['comments', orgId, projectId, issueId] });
  }
};

socket.on('comment:updated', handleCommentUpdated);
socket.on('comment:deleted', handleCommentDeleted);

  return (
  <div className="max-w-2xl mx-auto">
    {/* Back Navigation */}
    <Link
      to={`/organizations/${orgId}/projects/${projectId}`}
      className="text-sm text-slate-500 hover:text-indigo-600"
    >
      ← Back to issues
    </Link>

    {/* Issue Card Section */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 mt-3 mb-6">
      {isEditing ? (
        <IssueForm
          issue={issue}
          members={project?.members}
          isSubmitting={updateIssueMutation.isPending}
          onCancel={() => setIsEditing(false)}
          onSubmit={(payload) =>
            updateIssueMutation.mutate(
              { issueId, updates: payload },
              { onSuccess: () => setIsEditing(false) }
            )
          }
        />
      ) : (
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-slate-900">{issue.title}</h1>
            <button
              onClick={() => setIsEditing(true)}
              className="shrink-0 px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              Edit
            </button>
          </div>
          <p className="text-slate-600 mt-2">
            {issue.description || <em className="text-slate-400">No description</em>}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <div className="text-sm text-slate-500 mt-4 space-y-1">
            <p>Reporter: <span className="text-slate-700">{issue.reporter.name}</span></p>
            <p>Assignee: <span className="text-slate-700">{issue.assignee?.name || 'Unassigned'}</span></p>
            {issue.dueDate && (
              <p>Due: <span className="text-slate-700">{new Date(issue.dueDate).toLocaleDateString()}</span></p>
            )}
          </div>
          {issue.labels?.length > 0 && (
            <div className="flex gap-1 mt-3 flex-wrap">
              {issue.labels.map((label) => (
                <span key={label} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {updateIssueMutation.isError && (
        <p className="text-sm text-red-600 mt-3">
          {updateIssueMutation.error.response?.data?.message || 'Could not update issue'}
        </p>
      )}
    </div>

    {/* Comments Section */}
    <h2 className="text-lg font-semibold text-slate-900 mb-2">Comments</h2>
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      {commentsLoading ? (
        <p className="text-slate-400 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-slate-400 text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={(payload) => updateCommentMutation.mutate(payload)}
              onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
              currentMembershipRole={issue.myRole}
            />
          ))}
        </div>
      )}
      <form onSubmit={handleAddComment} className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={createCommentMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          Comment
        </button>
      </form>
    </div>

    {/* Activity Section */}
    <h2 className="text-lg font-semibold text-slate-900 mb-2">Activity</h2>
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {issueActivity.length === 0 ? (
        <p className="text-slate-400 text-sm">No activity recorded yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm text-slate-500">
          {issueActivity.map((entry) => (
            <li key={entry._id}>
              <span className="text-slate-700 font-medium">{entry.user.name}</span> — {entry.action}{' '}
              <span className="text-slate-400">({new Date(entry.createdAt).toLocaleString()})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);
};

export default IssueDetailPage;