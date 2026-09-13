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

  if (isLoading) return <div>Loading organizations...</div>;
  if (isError) return <div>Failed to load organizations. Please try again.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Your Organizations</h1>
        <button onClick={logout}>Log Out</button>
      </div>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New organization name"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
        />
        <button type="submit" disabled={createOrgMutation.isPending}>
          {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
        </button>
      </form>

      {organizations.length === 0 ? (
        <p>You're not part of any organizations yet. Create one above to get started.</p>
      ) : (
        <ul>
          {organizations.map((org) => (
            <li key={org._id}>
              <button onClick={() => navigate(`/organizations/${org._id}`)}>
                {org.name} <span style={{ color: '#888' }}>({org.myRole})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrganizationsPage;