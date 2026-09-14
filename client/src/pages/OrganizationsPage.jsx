import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations, useCreateOrganization } from '../hooks/useOrganizations';
import { useAuth } from '../context/AuthContext';

const OrganizationsPage = () => {
  const [newOrgName, setNewOrgName] = useState('');
  const { data: organizations, isLoading, isError } = useOrganizations();
  const createOrgMutation = useCreateOrganization();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    await createOrgMutation.mutateAsync(newOrgName);
    setNewOrgName('');
  };

  if (isLoading) return <div className="text-slate-400 text-sm">Loading organizations...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load organizations. Please try again.</div>;

  return (
  <div>
    <h1 className="text-2xl font-semibold text-slate-900 mb-6">Your Organizations</h1>

    <form onSubmit={handleCreate} className="flex gap-2 mb-6">
      <input
        type="text"
        placeholder="New organization name"
        value={newOrgName}
        onChange={(e) => setNewOrgName(e.target.value)}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={createOrgMutation.isPending}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
      </button>
    </form>

    {organizations.length === 0 ? (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
        <p className="text-slate-500">You're not part of any organizations yet.</p>
        <p className="text-slate-400 text-sm mt-1">Create one above to get started.</p>
      </div>
    ) : (
      <div className="space-y-2">
        {organizations.map((org) => (
          <button
            key={org._id}
            onClick={() => navigate(`/organizations/${org._id}`)}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 text-left hover:border-indigo-300 hover:shadow-sm transition"
          >
            <span className="font-medium text-slate-900">{org.name}</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {org.myRole}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);
};

export default OrganizationsPage;