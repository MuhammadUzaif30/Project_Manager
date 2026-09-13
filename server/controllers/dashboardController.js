const Issue = require('../models/Issue');
const ActivityLog = require('../models/ActivityLog');


const getProjectDashboard = async (req, res) => {
  try {
    const projectId = req.project._id;

    const [
      totalIssues,
      todoIssues,
      inProgressIssues,
      reviewIssues,
      doneIssues,
      highCriticalIssues,
      myIssues,
      recentActivity,
    ] = await Promise.all([
      Issue.countDocuments({ project: projectId }),
      Issue.countDocuments({ project: projectId, status: 'TODO' }),
      Issue.countDocuments({ project: projectId, status: 'IN_PROGRESS' }),
      Issue.countDocuments({ project: projectId, status: 'REVIEW' }),
      Issue.countDocuments({ project: projectId, status: 'DONE' }),
      Issue.countDocuments({ project: projectId, priority: { $in: ['HIGH', 'CRITICAL'] } }),
      Issue.countDocuments({ project: projectId, assignee: req.user._id }),
      ActivityLog.find({ project: projectId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      stats: {
        totalIssues,
        todoIssues,
        inProgressIssues,
        reviewIssues,
        doneIssues,
        highCriticalIssues,
        myIssues,
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectDashboard };