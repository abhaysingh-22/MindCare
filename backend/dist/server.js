"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const node_cron_1 = __importDefault(require("node-cron"));
const Database_1 = __importDefault(require("./models/Database"));
const MusicPreferencesService_1 = require("./services/MusicPreferencesService");
const MoodDetectionService_1 = require("./services/MoodDetectionService");
const MusicStreamingService_1 = require("./services/MusicStreamingService");
const musicRoutes_1 = require("./routes/musicRoutes");
// Load environment variables
dotenv_1.default.config();
class MindCareServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });
        this.setupDatabase();
        this.setupServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupScheduledTasks();
    }
    setupDatabase() {
        this.database = new Database_1.default();
    }
    setupServices() {
        this.musicService = new MusicPreferencesService_1.MusicPreferencesService(this.database);
        this.moodService = new MoodDetectionService_1.MoodDetectionService(this.database, this.musicService);
        this.streamingService = new MusicStreamingService_1.MusicStreamingService(this.database);
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS middleware
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true
        }));
        // Logging middleware
        this.app.use((0, morgan_1.default)('combined'));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    }
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'MindCare Music API'
            });
        });
        // API routes
        const musicRoutes = new musicRoutes_1.MusicRoutes(this.musicService, this.moodService, this.streamingService);
        this.app.use('/api/music', musicRoutes.getRouter());
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.originalUrl
            });
        });
        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error('Global error:', err);
            res.status(err.status || 500).json({
                error: err.message || 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            });
        });
    }
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            // Handle user joining their mood room
            socket.on('join-mood-room', (userId) => {
                socket.join(`user-${userId}`);
                console.log(`User ${userId} joined mood room`);
            });
            // Handle mood update requests
            socket.on('request-mood-update', async (userId) => {
                try {
                    const moodResult = await this.moodService.detectMood(userId);
                    socket.emit('mood-update', moodResult);
                    // If mood indicates user needs music, automatically provide recommendations
                    if (moodResult.mood_score < 6) { // Lower mood scores might benefit from music
                        const recommendations = await this.streamingService.getCuratedTracks(moodResult.mood_category, undefined, undefined, 5);
                        socket.emit('music-recommendations', {
                            reason: 'mood-support',
                            mood: moodResult.mood_category,
                            tracks: recommendations
                        });
                    }
                }
                catch (error) {
                    console.error('Error handling mood update request:', error);
                    socket.emit('error', { message: 'Failed to update mood' });
                }
            });
            // Handle real-time music playback events
            socket.on('music-played', async (data) => {
                try {
                    // Log the music session start
                    console.log(`User ${data.userId} started playing track ${data.trackId}`);
                    // You could store this in the database or trigger other actions
                    socket.emit('session-started', {
                        sessionId: Date.now(),
                        trackId: data.trackId
                    });
                }
                catch (error) {
                    console.error('Error handling music played event:', error);
                }
            });
            // Handle real-time feedback
            socket.on('submit-feedback', async (data) => {
                try {
                    // Process feedback and potentially update recommendations
                    console.log(`Received feedback from user ${data.userId}: rating ${data.rating}`);
                    // Update preference weights based on feedback
                    if (data.rating >= 4) {
                        // Positive feedback - could strengthen preferences
                        socket.emit('feedback-received', {
                            message: 'Thanks for the positive feedback!'
                        });
                    }
                }
                catch (error) {
                    console.error('Error handling feedback:', error);
                }
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    setupScheduledTasks() {
        // Check user moods every 5 minutes and provide proactive music recommendations
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            console.log('Running scheduled mood check...');
            try {
                // This would typically query for active users
                // For now, it's a placeholder for the automatic mood detection system
                console.log('Scheduled mood check completed');
            }
            catch (error) {
                console.error('Error in scheduled mood check:', error);
            }
        });
        // Clean up old logs and sessions daily at midnight
        node_cron_1.default.schedule('0 0 * * *', async () => {
            console.log('Running daily cleanup...');
            try {
                // Clean up old mood logs (older than 90 days)
                const database = this.database.getDatabase();
                database.run("DELETE FROM mood_logs WHERE timestamp < datetime('now', '-90 days')", (err) => {
                    if (err) {
                        console.error('Error cleaning up old mood logs:', err);
                    }
                    else {
                        console.log('Old mood logs cleaned up successfully');
                    }
                });
            }
            catch (error) {
                console.error('Error in daily cleanup:', error);
            }
        });
    }
    start() {
        const port = process.env.PORT || 3001;
        this.server.listen(port, () => {
            console.log(`🎵 MindCare Music API server running on port ${port}`);
            console.log(`🌐 WebSocket server ready for real-time connections`);
            console.log(`📊 Database initialized and ready`);
            console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`📋 API Documentation: http://localhost:${port}/health`);
                console.log(`🎧 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            }
        });
    }
    async shutdown() {
        console.log('Shutting down MindCare server...');
        // Close database connection
        if (this.database) {
            await this.database.close();
        }
        // Close HTTP server
        if (this.server) {
            this.server.close();
        }
        console.log('Server shutdown complete');
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
// Start the server
const server = new MindCareServer();
server.start();
exports.default = MindCareServer;
//# sourceMappingURL=server.js.map