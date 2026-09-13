const { body } = require('express-validator');

const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Active', 'Completed', 'Archived']).withMessage('Invalid status'),
];

module.exports = { createProjectValidation };