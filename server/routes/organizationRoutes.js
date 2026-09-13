const express = require('express');
const router = express.Router();
const projectRoutes = require('./projectRoutes');
const { getOrganizationActivity } = require('../controllers/activityController');

const {
  createOrganization,
  getMyOrganizations,
  getMembers,
  addMember,
  removeMember,
  changeMemberRole,
} = require('../controllers/organizationController');
const authenticate = require('../middleware/authenticate');
const requireOrgRole = require('../middleware/requireOrgRole');
const validate = require('../middleware/validate');
const { addMemberValidation, changeRoleValidation } = require('../validators/organizationValidators');

router.use(authenticate);

router.post('/', createOrganization);
router.get('/', getMyOrganizations);

router.get('/:orgId/members', requireOrgRole('Member'), getMembers);
router.post('/:orgId/members', requireOrgRole('Owner'), addMemberValidation, validate, addMember);
router.delete('/:orgId/members/:userId', requireOrgRole('Owner'), removeMember);
router.patch('/:orgId/members/:userId/role', requireOrgRole('Owner'), changeRoleValidation, validate, changeMemberRole);
router.get('/:orgId/activity', requireOrgRole('Member'), getOrganizationActivity);


router.use('/:orgId/projects', projectRoutes);

module.exports = router;