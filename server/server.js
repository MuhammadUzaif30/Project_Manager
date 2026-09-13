const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // <-- 1. ADD THIS IMPORT
require('dotenv').config();

// Imports
const socketAuth = require('./socket/socketAuth');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

// NEW: Import the models needed for socket authorization
const Membership = require('./models/Membership');
const Project = require('./models/Project');

const app = express();

// <-- 2. ADD THIS EXPRESS CORS MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.set('io', io);

// --- SECURE SOCKET LOGIC ---
// ... [The rest of your file remains exactly the same]
app.set('io', io);

// --- SECURE SOCKET LOGIC ---
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

      // 1. Check if user is Org Admin/Owner
      const isPrivileged = membership && ['Owner', 'Admin'].includes(membership.role);
      // 2. Check if user is explicitly added to this project
      const isProjectMember = project.members.some((id) => id.toString() === socket.user._id.toString());

      // 3. Only join the room if one of those is true
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
// -----------------------------

const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});