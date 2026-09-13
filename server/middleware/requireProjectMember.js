const requireProjectMember = (req, res, next) => {
  const isPrivileged = req.membership.role === 'Owner' || req.membership.role === 'Admin';
  const isProjectMember = req.project.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!isPrivileged && !isProjectMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  next();
};

module.exports = requireProjectMember;