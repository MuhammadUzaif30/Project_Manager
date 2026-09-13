const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const logActivity = require('../utils/logActivity');
const createComment = async (req, res) => {
  try {
    const { content } = req.body;

    const issue = await Issue.findOne({ _id: req.params.issueId, project: req.project._id });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      issue: issue._id,
      project: req.project._id,
    });

    await comment.populate('author', 'name email');

    await logActivity({
        organization: req.project.organization,
        project: req.project._id,
        user: req.user._id,
        action: 'Comment added',
        targetType: 'Comment',
        targetId: comment._id,
        metadata: { issue: issue._id },
});

    res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId, project: req.project._id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findOne({ _id: req.params.commentId, project: req.project._id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isPrivileged = req.membership.role === 'Owner' || req.membership.role === 'Admin';
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email');

    res.status(200).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, project: req.project._id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isPrivileged = req.membership.role === 'Owner' || req.membership.role === 'Admin';
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { createComment, listComments, updateComment, deleteComment };