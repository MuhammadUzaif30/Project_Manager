import { useState } from 'react';

const IssueForm = ({ issue, members, onSubmit, onCancel, isSubmitting }) => {
  const [title, setTitle] = useState(issue?.title || '');
  const [description, setDescription] = useState(issue?.description || '');
  const [status, setStatus] = useState(issue?.status || 'TODO');
  const [priority, setPriority] = useState(issue?.priority || 'MEDIUM');
  const [assignee, setAssignee] = useState(issue?.assignee?._id || '');
  const [dueDate, setDueDate] = useState(
    issue?.dueDate ? issue.dueDate.substring(0, 10) : ''
  );
  const [labelsText, setLabelsText] = useState((issue?.labels || []).join(', '));

  const isEditMode = !!issue;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsText
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const payload = {
      title,
      description,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
      labels,
    };

    if (isEditMode) {
      payload.status = status;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {isEditMode && (
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          </label>
        )}

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>

        <label>
          Assignee
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      <div>
        <label>Labels (comma-separated)</label>
        <input
          type="text"
          value={labelsText}
          onChange={(e) => setLabelsText(e.target.value)}
          placeholder="frontend, urgent, bug"
        />
      </div>

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Issue'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default IssueForm;