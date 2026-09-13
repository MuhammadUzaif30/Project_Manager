const { body } = require('express-validator');

const addMemberValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('role').optional().isIn(['Owner', 'Admin', 'Member']).withMessage('Role must be Owner, Admin, or Member'),
];

const changeRoleValidation = [
  body('role').isIn(['Owner', 'Admin', 'Member']).withMessage('Role must be Owner, Admin, or Member'),
];

module.exports = { addMemberValidation, changeRoleValidation };