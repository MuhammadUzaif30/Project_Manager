import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembers, useAddMember, useRemoveMember, useChangeMemberRole } from '../hooks/useOrganizations';

const OrganizationMembersPage = () => {
  const { orgId } = useParams();
  const { user } = useAuth();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const { data: members, isLoading, isError } = useMembers(orgId);
  const addMemberMutation = useAddMember(orgId);
  const removeMemberMutation = useRemoveMember(orgId);
  const changeRoleMutation = useChangeMemberRole(orgId);

  if (isLoading) return <div className="text-slate-400 text-sm">Loading members...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load members.</div>;

  const myMembership = members.find((m) => m.user._id === user.id);
  const isOwner = myMembership?.role === 'Owner';

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await addMemberMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('Member');
    } catch (err) {
      // surfaced via addMemberMutation.isError below
    }
  };

  const handleRoleChange = (userId, newRole) => {
    changeRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemove = (userId) => {
    if (window.confirm('Remove this member from the organization?')) {
      removeMemberMutation.mutate(userId);
    }
  };

  return (
  <div>
    <Link to={`/organizations/${orgId}`} className="text-sm text-slate-500 hover:text-indigo-600">
      ← Back to projects
    </Link>
    <h1 className="text-2xl font-semibold text-slate-900 mt-1 mb-6">Members</h1>

    {isOwner && (
      <form onSubmit={handleInvite} className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Email of registered user"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
          <option value="Owner">Owner</option>
        </select>
        <button
          type="submit"
          disabled={addMemberMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition whitespace-nowrap"
        >
          {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    )}

    {addMemberMutation.isError && (
      <p className="text-sm text-red-600 mb-2">
        {addMemberMutation.error.response?.data?.message || 'Could not add member'}
      </p>
    )}
    {removeMemberMutation.isError && (
      <p className="text-sm text-red-600 mb-2">
        {removeMemberMutation.error.response?.data?.message || 'Could not remove member'}
      </p>
    )}
    {changeRoleMutation.isError && (
      <p className="text-sm text-red-600 mb-2">
        {changeRoleMutation.error.response?.data?.message || 'Could not change role'}
      </p>
    )}

    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left font-medium text-slate-500 px-4 py-3">Name</th>
            <th className="text-left font-medium text-slate-500 px-4 py-3">Email</th>
            <th className="text-left font-medium text-slate-500 px-4 py-3">Role</th>
            {isOwner && <th className="px-4 py-3"></th>}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 text-slate-900 font-medium">{m.user.name}</td>
              <td className="px-4 py-3 text-slate-500">{m.user.email}</td>
              <td className="px-4 py-3">
                {isOwner ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                ) : (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {m.role}
                  </span>
                )}
              </td>
              {isOwner && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemove(m.user._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default OrganizationMembersPage;