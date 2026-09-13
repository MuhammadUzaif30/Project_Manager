const express = require('express');
const router = express.Router({ mergeParams: true });
const { createComment, listComments, updateComment, deleteComment } = require('../controllers/commentController');
const authenticate = require('../middleware/authenticate');
const requireOrgRole = require('../middleware/requireOrgRole');
const loadProject = require('../middleware/loadProject');
const requireProjectMember = require('../middleware/requireProjectMember');
const validate = require('../middleware/validate');
const { createCommentValidation } = require('../validators/commentValidators');

router.use(authenticate);
router.use(requireOrgRole('Member'));
router.use(loadProject);
router.use(requireProjectMember);

router.post('/', createCommentValidation, validate, createComment);
router.get('/', listComments);
router.patch('/:commentId', createCommentValidation, validate, updateComment);
router.delete('/:commentId', deleteComment);

module.exports = router;