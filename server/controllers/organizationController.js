const Organization = require('../models/Organization')
const Membership = require('../models/Membership')
const User = require('../models/User')
const logActivity = require('../utils/logActivity');

const createOrganization = async (req, res) => {
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
        
        // FIXED: Updated success message
        res.status(201).json({ message: 'Organization created successfully', organization });
    } catch(err) {
        console.error(err);
        // FIXED: Typo in message
        res.status(500).json({ message: 'Something went wrong' }); 
    }
};


const getMyOrganizations = async (req, res) => { 
    try {
        const memberships = await Membership.find({ user: req.user._id }).populate('organization');
        
        const organizations = memberships.map((m) => ({
            ...m.organization.toObject(),
            myRole: m.role,
        }));
        
        
        res.status(200).json({ organizations }); 
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getMembers = async (req, res) => {
  try {
    const memberships = await Membership.find({ organization: req.params.orgId }).populate('user', 'name email');
    res.status(200).json({ members: memberships });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const addMember = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const removeMember = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const changeMemberRole = async (req, res) => {
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

    membership.role = role;
    await logActivity({
        organization: orgId,
        project: null,
        user: req.user._id,
        action: 'Member role changed',
        targetType: 'Membership',
        targetId: membership._id,
        metadata: { targetUser: userId, from: membership.role, to: role },
});
    await membership.save();

    res.status(200).json({ membership });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrganization, getMyOrganizations, getMembers, addMember, removeMember, changeMemberRole };
