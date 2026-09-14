const express = require('express');
const router = express.Router({ mergeParams: true });
const { createIssue, getIssue, updateIssue, deleteIssue, listIssues, getProjectLabels } = require('../controllers/issueController');
const authenticate = require('../middleware/authenticate');
const requireOrgRole = require('../middleware/requireOrgRole');
const loadProject = require('../middleware/loadProject');
const requireProjectMember = require('../middleware/requireProjectMember');
const validate = require('../middleware/validate');
const { createIssueValidation , updateIssueValidation } = require('../validators/issueValidators');
const commentRoutes = require('./commentRoutes');


router.use(authenticate);
router.use(requireOrgRole('Member'));
router.use(loadProject);
router.use(requireProjectMember);

router.post('/', createIssueValidation, validate, createIssue);
router.get('/', listIssues);
router.get('/labels', getProjectLabels);
router.get('/:issueId', getIssue);
router.patch('/:issueId', updateIssueValidation, validate, updateIssue);
router.delete('/:issueId', deleteIssue);
router.use('/:issueId/comments', commentRoutes);

module.exports = router;