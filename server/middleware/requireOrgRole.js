const Membership = require('../models/Membership');

const roleWeight = { Member: 1, Admin: 2, Owner: 3 };

const requireOrgRole = (minimumRole) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.orgId;

      const membership = await Membership.findOne({
        user: req.user._id,
        organization: organizationId,
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this organization' });
      }

      if (roleWeight[membership.role] < roleWeight[minimumRole]) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }

      req.membership = membership;
      next();
    } catch (err) {
    next(err);
  }
  };
};

module.exports = requireOrgRole;