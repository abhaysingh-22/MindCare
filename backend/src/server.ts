import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Import routes
import musicRoutes from './routes/musicRoutes';
import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import sosRoutes from './routes/sosRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import quizRoutes from './routes/quizRoutes';

// Import services
import { MoodDetectionService } from './services/MoodDetectionServiceUpdated';
import { AuthService } from './services/AuthService';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize services
const prisma = new PrismaClient();
const moodDetectionService = new MoodDetectionService();
const authService = new AuthService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/quiz', quizRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MindCare Backend API',
    version: '2.0.0',
    features: [
      'Authentication & User Management',
      'Enhanced Mood Tracking & Analytics',
      'Music Integration & Recommendations',
      'SOS Emergency System',
      'Gamification & Achievements',
      'Mental Health Quizzes (PHQ-9, GAD-7)',
      'Real-time Mood Monitoring'
    ],
    endpoints: {
      auth: '/api/auth',
      mood: '/api/mood',
      music: '/api/music',
      sos: '/api/sos',
      gamification: '/api/gamification',
      quiz: '/api/quiz',
      health: '/api/health'
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication for real-time features
  socket.on('authenticate', async (token) => {
    try {
      const user = await authService.verifyToken(token);
      if (user) {
        socket.data.userId = user.id;
        socket.join(`user-${user.id}`);
        console.log(`User ${user.id} authenticated for real-time features`);
      }
    } catch (error) {
      console.error('Socket authentication failed:', error);
    }
  });

  // Handle mood updates
  socket.on('mood-update', async (moodData) => {
    try {
      if (!socket.data.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Process mood update
      const analysis = await moodDetectionService.analyzeMoodPatterns(socket.data.userId);
      
      // Send back analysis
      socket.emit('mood-analysis', analysis);

      // If concerning patterns detected, notify user
      if (analysis.patterns.includes('declining_mood') || analysis.patterns.includes('persistent_low_mood')) {
        socket.emit('mood-alert', {
          type: 'concern',
          message: 'We\'ve noticed some concerning mood patterns. Consider reaching out for support.',
          recommendations: analysis.recommendations
        });
      }
    } catch (error) {
      console.error('Error processing mood update:', error);
      socket.emit('error', { message: 'Failed to process mood update' });
    }
  });

  // Handle SOS alerts
  socket.on('sos-alert', async (alertData) => {
    try {
      if (!socket.data.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Broadcast emergency alert to admin/monitoring systems
      io.emit('emergency-alert', {
        userId: socket.data.userId,
        timestamp: new Date().toISOString(),
        location: alertData.location,
        message: alertData.message
      });

      console.log(`Emergency alert triggered by user ${socket.data.userId}`);
    } catch (error) {
      console.error('Error handling SOS alert:', error);
    }
  });

  // Handle music requests
  socket.on('request-music', async (moodData) => {
    try {
      if (!socket.data.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // This would integrate with music service to get recommendations
      socket.emit('music-recommendations', {
        mood: moodData.mood,
        tracks: [] // Would be populated by music service
      });
    } catch (error) {
      console.error('Error handling music request:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Run database migrations if needed
    console.log('📊 Database schema ready');

    const PORT = process.env.PORT || 3001;
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 MindCare Backend Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`� Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ WebSocket server running for real-time features`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await prisma.$disconnect();
      httpServer.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();