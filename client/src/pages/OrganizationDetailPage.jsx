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

  if (isLoading) return <div className="text-slate-400 text-sm">Loading projects...</div>;
  if (isError) return <div className="text-red-600 text-sm">Failed to load projects.</div>;

  return (
  <div>
    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
      <Link to="/organization" className="hover:text-indigo-600">← Organizations</Link>
      <span>·</span>
      <Link to={`/organizations/${orgId}/members`} className="hover:text-indigo-600">Members</Link>
    </div>
    <h1 className="text-2xl font-semibold text-slate-900 mb-6">Projects</h1>

    <form onSubmit={handleCreate} className="flex gap-2 mb-2">
      <input
        type="text"
        placeholder="New project name"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={createProjectMutation.isPending}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
      </button>
    </form>

    {createProjectMutation.isError && (
      <p className="text-sm text-red-600 mb-4">
        {createProjectMutation.error.response?.data?.message || 'Could not create project'}
      </p>
    )}

    <div className="mt-4">
      {projects.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-500">No projects yet.</p>
          <p className="text-slate-400 text-sm mt-1">Create one above, or ask an Admin to add you to one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => navigate(`/organizations/${orgId}/projects/${project._id}`)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 text-left hover:border-indigo-300 hover:shadow-sm transition"
            >
              <span className="font-medium text-slate-900">{project.name}</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {project.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default OrganizationDetailPage;