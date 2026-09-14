const StatCard = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
    <div className="text-2xl font-semibold text-slate-900">{value}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

export default StatCard;