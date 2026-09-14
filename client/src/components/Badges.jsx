const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusStyles = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
};

export const PriorityBadge = ({ priority }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyles[priority]}`}>
    {priority}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
    {status.replace('_', ' ')}
  </span>
);