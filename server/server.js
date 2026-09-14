const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const socketAuth = require('./socket/socketAuth');
const Membership = require('./models/Membership');
const Project = require('./models/Project');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.set('io', io);

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

  socket.on('joinProject', async (projectId) => {
    try {
      const project = await Project.findById(projectId);
      if (!project) return;

      const membership = await Membership.findOne({
        user: socket.user._id,
        organization: project.organization,
      });

      const isPrivileged = membership && ['Owner', 'Admin'].includes(membership.role);
      const isProjectMember = project.members.some((id) => id.toString() === socket.user._id.toString());

      if (membership && (isPrivileged || isProjectMember)) {
        socket.join(`project:${projectId}`);
        console.log(`${socket.user.name} securely joined project:${projectId}`);
      } else {
        console.log(`${socket.user.name} denied access to project:${projectId}`);
      }
    } catch (err) {
      console.error('joinProject error:', err);
    }
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.user.name} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000000, // Fail fast if connection hangs
})
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });