import { useParams, Link } from 'react-router-dom';
import { useProjectActivity } from '../hooks/useActivity';

const formatMetadataEntry = (key, value) => {
  if (key === 'issueTitle') return `Issue: "${value}"`;
  if (key === 'from' || key === 'to') return null; // handled together below
  return `${key}: ${value}`;
};

const ProjectActivityPage = () => {
  const { orgId, projectId } = useParams();
  const { data: activity, isLoading, isError } = useProjectActivity(orgId, projectId);

  if (isLoading) return <div className="text-slate-400 text-sm">Loading activity...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load activity.</div>;

  const actionColors = {
    'Issue created': 'border-blue-400',
    'Issue status changed': 'border-orange-400',
    'Issue priority changed': 'border-orange-400',
    'Issue assigned': 'border-purple-400',
    'Issue deleted': 'border-red-400',
    'Comment added': 'border-green-400',
  };

  return (
    <div>
      <Link
        to={`/organizations/${orgId}/projects/${projectId}`}
        className="text-sm text-slate-500 hover:text-indigo-600"
      >
        ← Back to issues
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mt-1 mb-6">Project Activity</h1>

      {activity.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-500">No activity recorded yet for this project.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activity.map((entry) => (
            <div
              key={entry._id}
              className={`bg-white border-l-4 ${actionColors[entry.action] || 'border-slate-300'} border-y border-r border-slate-200 rounded-lg p-3`}
            >
              <div className="text-sm">
                <span className="font-medium text-slate-900">{entry.user.name}</span>
                <span className="text-slate-500"> — {entry.action}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {new Date(entry.createdAt).toLocaleString()}
              </div>
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  {entry.metadata.from !== undefined && entry.metadata.to !== undefined && (
                    <span className="mr-3">{String(entry.metadata.from)} → {String(entry.metadata.to)}</span>
                  )}
                  {Object.entries(entry.metadata)
                    .filter(([key]) => !['from', 'to', 'issueId'].includes(key))
                    .map(([key, value]) => (
                      <span key={key} className="mr-3">{formatMetadataEntry(key, value)}</span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectActivityPage;