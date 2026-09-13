const { body } = require('express-validator');

const createIssueValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('assignee').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date'),
  body('labels').optional().isArray().withMessage('Labels must be an array'),
];

module.exports = { createIssueValidation };