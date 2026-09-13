const Issue = require('../models/Issue');
const Membership = require('../models/Membership');
const logActivity = require('../utils/logActivity');
const createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate, labels } = req.body;

    const issue = await Issue.create({
      title,
      description,
      status,
      priority,
      assignee: assignee || null,
      reporter: req.user._id,
      project: req.project._id,
      dueDate: dueDate || null,
      labels: labels || [],
    });

    await logActivity({
      organization: req.project.organization,
      project: req.project._id,
      user: req.user._id,
      action: 'Issue created',
      targetType: 'Issue',
      targetId: issue._id,
      metadata: { title: issue.title },
    });
    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('issue:created', issue);

    res.status(201).json({ issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.issueId, project: req.project._id })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ issue, myRole: req.membership.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateIssue = async (req, res) => {
  try {
    // Safely get the ID whether your route uses :id or :issueId
    const issueId = req.params.issueId || req.params.id;
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Role check logic
    const membership = await Membership.findOne({
      user: req.user._id,
      organization: req.params.orgId,
    });

    const isPrivileged = membership && ['Owner', 'Admin'].includes(membership.role);
    const isAssigned = issue.assignee && issue.assignee.toString() === req.user._id.toString();

    if (!isPrivileged && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this issue' });
    }

    // Apply updates
    const updatableFields = ['title', 'description', 'status', 'priority', 'type', 'assignee', 'labels'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        issue[field] = req.body[field];
      }
    });

    await issue.save();

    // Socket.io Real-time Event (Safely grab the project ID directly from the issue)
    const io = req.app.get('io');
    if (io && issue.project) {
      io.to(`project:${issue.project.toString()}`).emit('issue:updated', issue);
    }

    res.status(200).json({ issue });
  } catch (err) {
    // Safely catch Mongoose validation errors
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.issueId, project: req.project._id });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isPrivileged = req.membership.role === 'Owner' || req.membership.role === 'Admin';
    if (!isPrivileged) {
      return res.status(403).json({ message: 'Only Admins or Owners can delete issues' });
    }

    await logActivity({
      organization: req.project.organization,
      project: req.project._id,
      user: req.user._id,
      action: 'Issue deleted',
      targetType: 'Issue',
      targetId: issue._id,
      metadata: { title: issue.title },
    });

    await issue.deleteOne();
    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('issue:deleted', { issueId: issue._id });

    res.status(200).json({ message: 'Issue deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
const listIssues = async (req, res) => {
  try {
    const { status, priority, assignee, label, search, sortBy, order, page, limit } = req.query;

    const filter = { project: req.project._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (label) filter.labels = label;
    if (search) filter.$text = { $search: search };

    const sortableFields = { createdAt: 'createdAt', updatedAt: 'updatedAt', dueDate: 'dueDate', priority: 'priority' };
    const sortField = sortableFields[sortBy] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('assignee', 'name email')
        .populate('reporter', 'name email'),
      Issue.countDocuments(filter),
    ]);

    res.status(200).json({
      issues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }

};

module.exports = { createIssue, getIssue, updateIssue, deleteIssue, listIssues }
