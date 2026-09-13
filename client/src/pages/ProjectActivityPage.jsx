import { useParams, Link } from 'react-router-dom';
import { useProjectActivity } from '../hooks/useActivity';

const actionColors = {
  'Issue created': '#3b82f6',
  'Issue status changed': '#f97316',
  'Issue priority changed': '#f97316',
  'Issue assigned': '#8b5cf6',
  'Issue deleted': '#ef4444',
  'Comment added': '#10b981',
};

const ProjectActivityPage = () => {
  const { orgId, projectId } = useParams();
  const { data: activity, isLoading, isError } = useProjectActivity(orgId, projectId);

  if (isLoading) return <div>Loading activity...</div>;
  if (isError) return <div>Failed to load activity.</div>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Link to={`/organizations/${orgId}/projects/${projectId}`}>← Back to issues</Link>
      <h1>Project Activity</h1>

      {activity.length === 0 ? (
        <p>No activity recorded yet for this project.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {activity.map((entry) => (
            <li
              key={entry._id}
              style={{
                borderLeft: `3px solid ${actionColors[entry.action] || '#888'}`,
                paddingLeft: 12,
                marginBottom: 10,
              }}
            >
              <div>
                <strong>{entry.user.name}</strong> — {entry.action}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                {new Date(entry.createdAt).toLocaleString()}
              </div>
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div style={{ fontSize: 13, color: '#888' }}>
                  {Object.entries(entry.metadata).map(([key, value]) => (
                    <span key={key} style={{ marginRight: 12 }}>
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectActivityPage;