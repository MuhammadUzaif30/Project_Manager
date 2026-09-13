const { body } = require('express-validator');

const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Active', 'Completed', 'Archived']).withMessage('Invalid status'),
];
const updateProjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Active', 'Completed', 'Archived']).withMessage('Invalid status'),
];

module.exports = { createProjectValidation, updateProjectValidation };