import { StatusBadge, PriorityBadge } from './Badges';

const IssueCard = ({ issue, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-4 mb-2 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900">{issue.title}</span>
        <PriorityBadge priority={issue.priority} />
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <StatusBadge status={issue.status} />
        <span>· {issue.assignee?.name || 'Unassigned'}</span>
        {issue.dueDate && <span>· Due {new Date(issue.dueDate).toLocaleDateString()}</span>}
      </div>

      {issue.labels?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {issue.labels.map((label) => (
            <span key={label} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueCard;