const { body } = require('express-validator');

const createCommentValidation = [
  body('content').trim().notEmpty().withMessage('Comment cannot be empty'),
];

module.exports = { createCommentValidation };