import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useProjects';

const OrganizationDetailPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [newProjectName, setNewProjectName] = useState('');
  const { data: projects, isLoading, isError } = useProjects(orgId);
  const createProjectMutation = useCreateProject(orgId);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProjectMutation.mutateAsync({ name: newProjectName });
      setNewProjectName('');
    } catch (err) {
      // A 403 here means this user is a Member, not Admin/Owner — they can view
      // projects but not create them. We'll surface this properly in the next step.
      console.error(err.response?.data?.message);
    }
  };

  if (isLoading) return <div>Loading projects...</div>;
  if (isError) return <div>Failed to load projects.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <Link to="/">← Back to organizations</Link>
      {' · '}
      <Link to={`/organizations/${orgId}/members`}>Members</Link>
      <h1>Projects</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button type="submit" disabled={createProjectMutation.isPending}>
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {createProjectMutation.isError && (
        <p style={{ color: 'red' }}>
          {createProjectMutation.error.response?.data?.message || 'Could not create project'}
        </p>
      )}

      {projects.length === 0 ? (
        <p>No projects yet. Create one above, or ask an Admin to add you to one.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project._id}>
              <button onClick={() => navigate(`/organizations/${orgId}/projects/${project._id}`)}>
                {project.name} <span style={{ color: '#888' }}>({project.status})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrganizationDetailPage;