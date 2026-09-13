import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIssue, useUpdateIssue } from '../hooks/useIssues';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../hooks/useComments';
import { useProjectActivity } from '../hooks/useActivity';
import CommentItem from '../components/CommentItem';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';

const IssueDetailPage = () => {
  const { orgId, projectId, issueId } = useParams();
  const [newComment, setNewComment] = useState('');
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

  const updateIssueMutation = useUpdateIssue(orgId, projectId);
  const createCommentMutation = useCreateComment(orgId, projectId, issueId);
  const updateCommentMutation = useUpdateComment(orgId, projectId, issueId);
  const deleteCommentMutation = useDeleteComment(orgId, projectId, issueId);

  if (issueLoading) return <div>Loading issue...</div>;
  if (issueError) return <div>Failed to load issue.</div>;

  const issueActivity = (allActivity || []).filter((a) => a.targetId === issueId);

  const handleStatusChange = (e) => {
    updateIssueMutation.mutate({ issueId, updates: { status: e.target.value } });
  };

  const handlePriorityChange = (e) => {
    updateIssueMutation.mutate({ issueId, updates: { priority: e.target.value } });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment, { onSuccess: () => setNewComment('') });
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Link to={`/organizations/${orgId}/projects/${projectId}`}>← Back to issues</Link>
      <h1>{issue.title}</h1>
      <p>{issue.description || <em>No description</em>}</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <label>
          Status:{' '}
          <select value={issue.status} onChange={handleStatusChange}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        </label>

        <label>
          Priority:{' '}
          <select value={issue.priority} onChange={handlePriorityChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
      </div>

      <p style={{ fontSize: 14, color: '#666' }}>
        Reporter: {issue.reporter.name} · Assignee: {issue.assignee?.name || 'Unassigned'}
      </p>

      {updateIssueMutation.isError && (
        <p style={{ color: 'red' }}>
          {updateIssueMutation.error.response?.data?.message || 'Could not update issue'}
        </p>
      )}

      <h2>Comments</h2>
      {commentsLoading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onUpdate={(payload) => updateCommentMutation.mutate(payload)}
            onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            currentMembershipRole={issue.myRole}
          />
        ))
      )}

      <form onSubmit={handleAddComment} style={{ marginTop: 12 }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ width: '70%' }}
        />
        <button type="submit" disabled={createCommentMutation.isPending}>
          Comment
        </button>
      </form>

      <h2>Activity</h2>
      {issueActivity.length === 0 ? (
        <p>No activity recorded yet.</p>
      ) : (
        <ul>
          {issueActivity.map((entry) => (
            <li key={entry._id} style={{ fontSize: 14, color: '#666' }}>
              {entry.user.name} — {entry.action} ({new Date(entry.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueDetailPage;