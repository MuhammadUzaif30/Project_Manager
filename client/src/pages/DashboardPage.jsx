import { useParams, Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import StatCard from '../components/StatCard';

const DashboardPage = () => {
  const { orgId, projectId } = useParams();
  const { data, isLoading, isError } = useDashboard(orgId, projectId);

  if (isLoading) return <div className="text-slate-400 text-sm">Loading dashboard...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load dashboard.</div>;

  const { stats, recentActivity } = data;

  return (
  <div>
    <Link
      to={`/organizations/${orgId}/projects/${projectId}`}
      className="text-sm text-slate-500 hover:text-indigo-600"
    >
      ← Back to issues
    </Link>
    <h1 className="text-2xl font-semibold text-slate-900 mt-1 mb-6">Dashboard</h1>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <StatCard label="Total Issues" value={stats.totalIssues} />
      <StatCard label="TODO" value={stats.todoIssues} />
      <StatCard label="In Progress" value={stats.inProgressIssues} />
      <StatCard label="Review" value={stats.reviewIssues} />
      <StatCard label="Done" value={stats.doneIssues} />
      <StatCard label="High/Critical" value={stats.highCriticalIssues} />
      <StatCard label="Assigned to Me" value={stats.myIssues} />
    </div>

    <h2 className="text-lg font-semibold text-slate-900 mb-2">Recent Activity</h2>
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {recentActivity.length === 0 ? (
        <p className="text-slate-400 text-sm">No recent activity.</p>
      ) : (
        <ul className="space-y-1.5 text-sm text-slate-500">
          {recentActivity.map((entry) => (
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
export default DashboardPage;