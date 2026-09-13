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
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0 }}>Project Members</h3>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {project.members.map((member) => (
          <li key={member._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>{member.name} ({member.email})</span>
            {canManage && (
              <button onClick={() => handleRemove(member._id)}>Remove</button>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <div style={{ marginTop: 8 }}>
          <select defaultValue="" onChange={handleAdd}>
            <option value="" disabled>
              + Add a member from the organization...
            </option>
            {eligibleToAdd.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {(addMemberMutation.isError || removeMemberMutation.isError) && (
        <p style={{ color: 'red' }}>
          {(addMemberMutation.error || removeMemberMutation.error)?.response?.data?.message ||
            'Could not update project members'}
        </p>
      )}
    </div>
  );
};

export default ProjectMembersSection;