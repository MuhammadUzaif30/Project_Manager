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

  if (isLoading) return <div>Loading members...</div>;
  if (isError) return <div>Failed to load members.</div>;

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
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <Link to={`/organizations/${orgId}`}>← Back to projects</Link>
      <h1>Members</h1>

      {isOwner && (
        <form onSubmit={handleInvite} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="Email of registered user"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
          </select>
          <button type="submit" disabled={addMemberMutation.isPending}>
            {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      )}

      {addMemberMutation.isError && (
        <p style={{ color: 'red' }}>
          {addMemberMutation.error.response?.data?.message || 'Could not add member'}
        </p>
      )}
      {removeMemberMutation.isError && (
        <p style={{ color: 'red' }}>
          {removeMemberMutation.error.response?.data?.message || 'Could not remove member'}
        </p>
      )}
      {changeRoleMutation.isError && (
        <p style={{ color: 'red' }}>
          {changeRoleMutation.error.response?.data?.message || 'Could not change role'}
        </p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {isOwner && <th></th>}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{m.user.name}</td>
              <td>{m.user.email}</td>
              <td>
                {isOwner ? (
                  <select value={m.role} onChange={(e) => handleRoleChange(m.user._id, e.target.value)}>
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                ) : (
                  m.role
                )}
              </td>
              {isOwner && (
                <td>
                  <button onClick={() => handleRemove(m.user._id)}>Remove</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationMembersPage;