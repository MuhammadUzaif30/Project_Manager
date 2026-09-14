import { useAddProjectMember, useRemoveProjectMember } from '../hooks/useProjects';

const ProjectMembersSection = ({ orgId, projectId, project, orgMembers, canManage }) => {
  const addMemberMutation = useAddProjectMember(orgId, projectId);
  const removeMemberMutation = useRemoveProjectMember(orgId, projectId);

  const projectMemberIds = new Set((project.members || []).map((m) => m._id));
  const eligibleToAdd = (orgMembers || []).filter((m) => !projectMemberIds.has(m.user._id));

  const handleAdd = (e) => {
    const userId = e.target.value;
    if (!userId) return;
    addMemberMutation.mutate(userId);
    e.target.value = '';
  };

  const handleRemove = (userId) => {
    removeMemberMutation.mutate(userId);
  };

  return (
  <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
    <h3 className="text-sm font-semibold text-slate-900 mb-3">Project Members</h3>

    <div className="space-y-2">
      {project.members.map((member) => (
        <div key={member._id} className="flex items-center justify-between text-sm">
          <span className="text-slate-700">
            {member.name} <span className="text-slate-400">({member.email})</span>
          </span>
          {canManage && (
            <button
              onClick={() => handleRemove(member._id)}
              className="text-red-600 text-xs hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>

    {canManage && (
      <div className="mt-3 pt-3 border-t border-slate-100">
        <select
          defaultValue=""
          onChange={handleAdd}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>+ Add a member from the organization...</option>
          {eligibleToAdd.map((m) => (
            <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
          ))}
        </select>
      </div>
    )}

    {(addMemberMutation.isError || removeMemberMutation.isError) && (
      <p className="text-sm text-red-600 mt-2">
        {(addMemberMutation.error || removeMemberMutation.error)?.response?.data?.message ||
          'Could not update project members'}
      </p>
    )}
  </div>
);
};

export default ProjectMembersSection;