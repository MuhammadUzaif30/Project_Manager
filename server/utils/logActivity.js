const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ organization, project, user, action, targetType, targetId, metadata }) => {
  try {
    await ActivityLog.create({ organization, project, user, action, targetType, targetId, metadata });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = logActivity;