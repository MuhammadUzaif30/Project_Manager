const express = require('express');
const router = express.Router({ mergeParams: true });
const issueRoutes = require('./issueRoutes');
const { createProjectValidation, updateProjectValidation } = require('../validators/projectValidators');
const { getProjectActivity } = require('../controllers/activityController');
const { getProjectDashboard } = require('../controllers/dashboardController');
const {
  createProject,
  listProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const requireOrgRole = require('../middleware/requireOrgRole');
const loadProject = require('../middleware/loadProject');
const requireProjectMember = require('../middleware/requireProjectMember');
const validate = require('../middleware/validate');

router.use(authenticate);
router.use(requireOrgRole('Member'));

router.post('/', requireOrgRole('Admin'), createProjectValidation, validate, createProject);
router.get('/', listProjects);

router.get('/:projectId', loadProject, requireProjectMember, getProjectDetails);
router.patch('/:projectId', requireOrgRole('Admin'), loadProject, updateProjectValidation, validate, updateProject);
router.delete('/:projectId', requireOrgRole('Admin'), loadProject, deleteProject);
router.post('/:projectId/members', requireOrgRole('Admin'), loadProject, addProjectMember);
router.delete('/:projectId/members/:userId', requireOrgRole('Admin'), loadProject, removeProjectMember);
router.get('/:projectId/activity', loadProject, requireProjectMember, getProjectActivity);
router.use('/:projectId/issues', issueRoutes);
router.get('/:projectId/dashboard', loadProject, requireProjectMember, getProjectDashboard);

module.exports = router;