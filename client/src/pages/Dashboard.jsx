import { useParams, Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import StatCard from '../components/StatCard';

const DashboardPage = () => {
  const { orgId, projectId } = useParams();
  const { data, isLoading, isError } = useDashboard(orgId, projectId);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (isError) return <div>Failed to load dashboard.</div>;

  const { stats, recentActivity } = data;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Link to={`/organizations/${orgId}/projects/${projectId}`}>← Back to issues</Link>
      <h1>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Issues" value={stats.totalIssues} />
        <StatCard label="TODO" value={stats.todoIssues} />
        <StatCard label="In Progress" value={stats.inProgressIssues} />
        <StatCard label="Review" value={stats.reviewIssues} />
        <StatCard label="Done" value={stats.doneIssues} />
        <StatCard label="High/Critical" value={stats.highCriticalIssues} />
        <StatCard label="Assigned to Me" value={stats.myIssues} />
      </div>

      <h2>Recent Activity</h2>
      {recentActivity.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul>
          {recentActivity.map((entry) => (
            <li key={entry._id} style={{ fontSize: 14, color: '#666' }}>
              {entry.user.name} — {entry.action} ({new Date(entry.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage;