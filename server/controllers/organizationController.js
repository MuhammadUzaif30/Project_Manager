const Organization = require('../models/Organization');
const Membership = require('../models/Membership');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

const createOrganization = async (req, res, next) => {
  try {
    const { name } = req.body;
    const organization = await Organization.create({
      name,
      createdBy: req.user._id,
    });

    await Membership.create({
      user: req.user._id,
      organization: organization._id,
      role: 'Owner',
    });

    res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (err) {
    next(err);
  }
};

const getMyOrganizations = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).populate('organization');

    const organizations = memberships.map((m) => ({
      ...m.organization.toObject(),
      myRole: m.role,
    }));

    res.status(200).json({ organizations });
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ organization: req.params.orgId }).populate('user', 'name email');
    res.status(200).json({ members: memberships });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const organizationId = req.params.orgId;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email. They must register first.' });
    }

    const existing = await Membership.findOne({ user: user._id, organization: organizationId });
    if (existing) {
      return res.status(409).json({ message: 'This user is already a member of the organization' });
    }

    const membership = await Membership.create({
      user: user._id,
      organization: organizationId,
      role: role || 'Member',
    });

    await logActivity({
      organization: organizationId,
      project: null,
      user: req.user._id,
      action: 'Organization member added',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { addedUser: user._id, role: membership.role },
    });

    res.status(201).json({ membership });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { orgId, userId } = req.params;

    const membership = await Membership.findOne({ user: userId, organization: orgId });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    if (membership.role === 'Owner') {
      const ownerCount = await Membership.countDocuments({ organization: orgId, role: 'Owner' });
      if (ownerCount <= 1) {
        return res.status(409).json({ message: 'Cannot remove the only Owner of the organization' });
      }
    }

    await logActivity({
      organization: orgId,
      project: null,
      user: req.user._id,
      action: 'Organization member removed',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { removedUser: userId },
    });

    await membership.deleteOne();
    res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

const changeMemberRole = async (req, res, next) => {
  try {
    const { orgId, userId } = req.params;
    const { role } = req.body;

    const membership = await Membership.findOne({ user: userId, organization: orgId });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    if (membership.role === 'Owner' && role !== 'Owner') {
      const ownerCount = await Membership.countDocuments({ organization: orgId, role: 'Owner' });
      if (ownerCount <= 1) {
        return res.status(409).json({ message: 'Cannot demote the only Owner of the organization' });
      }
    }

    const previousRole = membership.role;
    membership.role = role;
    await membership.save();

    await logActivity({
      organization: orgId,
      project: null,
      user: req.user._id,
      action: 'Member role changed',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { targetUser: userId, from: previousRole, to: role },
    });

    res.status(200).json({ membership });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrganization, getMyOrganizations, getMembers, addMember, removeMember, changeMemberRole };