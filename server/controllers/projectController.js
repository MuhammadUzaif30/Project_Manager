const Project = require('../models/Project');
const Membership = require('../models/Membership');
const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      organization: req.params.orgId,
      members: [req.user._id],
      createdBy: req.user._id,
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const listProjects = async (req, res) => {
  try {
    const isPrivileged = req.membership.role === 'Owner' || req.membership.role === 'Admin';

    const filter = { organization: req.params.orgId };
    if (!isPrivileged) {
      filter.members = req.user._id;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const project = await req.project.populate('members', 'name email');
    res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    if (status !== undefined) req.project.status = status;

    await req.project.save();
    res.status(200).json({ project: req.project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const deleteProject = async (req, res) => {
  try {
    await req.project.deleteOne();
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const membership = await Membership.findOne({
      user: userId,
      organization: req.project.organization,
    });
    if (!membership) {
      return res.status(400).json({ message: 'User must be a member of the organization before being added to a project' });
    }

    if (req.project.members.some((id) => id.toString() === userId)) {
      return res.status(409).json({ message: 'User is already a project member' });
    }

    req.project.members.push(userId);
    await req.project.save();
    res.status(200).json({ project: req.project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
const removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.params;

    req.project.members = req.project.members.filter((id) => id.toString() !== userId);
    await req.project.save();
    res.status(200).json({ project: req.project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  createProject,
  listProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};