const priorityColors = {
  LOW: '#888',
  MEDIUM: '#3b82f6',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const IssueCard = ({ issue, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{issue.title}</strong>
        <span style={{ color: priorityColors[issue.priority] }}>{issue.priority}</span>
      </div>
      <div style={{ fontSize: 14, color: '#666' }}>
        {issue.status} · Assignee: {issue.assignee?.name || 'Unassigned'}
        {issue.dueDate && ` · Due ${new Date(issue.dueDate).toLocaleDateString()}`}
      </div>
      {issue.labels?.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {issue.labels.map((label) => (
            <span
              key={label}
              style={{ fontSize: 12, background: '#eee', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueCard;