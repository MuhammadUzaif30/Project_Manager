const Project = require('../models/Project');

const loadProject = async (req, res, next) => {
  try {
    const { orgId, projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, organization: orgId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = loadProject;