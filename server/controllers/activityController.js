const ActivityLog = require('../models/ActivityLog');

const getProjectActivity = async (req, res) => {
  try {
    const activity = await ActivityLog.find({ project: req.project._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getOrganizationActivity = async (req, res) => {
  try {
    const activity = await ActivityLog.find({ organization: req.params.orgId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ activity });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectActivity, getOrganizationActivity };