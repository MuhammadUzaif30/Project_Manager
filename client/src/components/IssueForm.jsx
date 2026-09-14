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
  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className={labelClass}>Title</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
    </div>

    <div>
      <label className={labelClass}>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className={inputClass}
      />
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {isEditMode && (
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Assignee</label>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
          <option value="">Unassigned</option>
          {members?.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Due date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>

    <div>
      <label className={labelClass}>Labels (comma-separated)</label>
      <input
        type="text"
        value={labelsText}
        onChange={(e) => setLabelsText(e.target.value)}
        placeholder="frontend, urgent, bug"
        className={inputClass}
      />
    </div>

    <div className="flex gap-2 pt-2">
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Issue'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
);
};

export default IssueForm;