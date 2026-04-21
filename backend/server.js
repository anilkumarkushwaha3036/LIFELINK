const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { initEngine, acceptEmergency } = require('./services/pulseEngine');

const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*', // We will restrict this in production
    methods: ['GET', 'POST']
  }
});

// Initialize the Business Logic Engine with WebSockets
initEngine(io);

// Middleware
app.use(cors());
app.use(express.json());

// Make Uploads Folder Static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Note: Base route is handled below based on environment

// Import Routes
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const donorRoutes = require('./routes/donorRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/admin', adminRoutes);

// --- Serve Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('PulseNet Backend System - Active (Dev Mode)');
  });
}

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // When a verified user comes online
  socket.on('join_grid', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Donor Joined Grid] UserID: ${userId}`);
    socket.emit('grid_status', { status: 'online', userId });
  });

  // When a Hospital logs in to their Command Center
  socket.on('hospital_join', (hospitalId) => {
    socket.join(`hospital_${hospitalId}`);
    console.log(`[Hospital Command Center Active] ID: ${hospitalId}`);
  });

  // When a donor receives an alert and hits "ACCEPT"
  socket.on('accept_emergency', async (data) => {
    const { requestId, donorId, timeTaken } = data;
    const success = await acceptEmergency(requestId, donorId, timeTaken);
    if(success) {
      socket.emit('emergency_accepted_success', { message: 'Thanks for saving a life!' });
    } else {
      socket.emit('emergency_accepted_failed', { message: 'Request already fulfilled by someone else.' });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Initialization] PulseNet System running on PORT ${PORT}`);
});
