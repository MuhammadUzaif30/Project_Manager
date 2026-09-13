const IssueFilterBar = ({ filters, onChange, members, availableLabels }) => {
  const update = (field, value) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Search issues..."
        value={filters.search || ''}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={filters.status || ''} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="REVIEW">Review</option>
        <option value="DONE">Done</option>
      </select>
      <select value={filters.priority || ''} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <select value={filters.assignee || ''} onChange={(e) => update('assignee', e.target.value)}>
        <option value="">All assignees</option>
        {members?.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>
      <select value={filters.label || ''} onChange={(e) => update('label', e.target.value)}>
        <option value="">All labels</option>
        {availableLabels?.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <select value={filters.sortBy || 'createdAt'} onChange={(e) => update('sortBy', e.target.value)}>
        <option value="createdAt">Sort: Created</option>
        <option value="updatedAt">Sort: Updated</option>
        <option value="dueDate">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
      </select>
      <select value={filters.order || 'desc'} onChange={(e) => update('order', e.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
};

export default IssueFilterBar;