import express from 'express';
import { EnhancedMoodService } from '../services/EnhancedMoodService';
import { AuthService } from '../services/AuthService';

const router = express.Router();
const moodService = new EnhancedMoodService();
const authService = new AuthService();

// Middleware to authenticate requests
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Log mood
router.post('/log', authenticate, async (req: any, res) => {
  try {
    const moodEntry = await moodService.logMood(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: moodEntry,
      message: 'Mood logged successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to log mood'
    });
  }
});

// Get mood history
router.get('/history', authenticate, async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const history = await moodService.getMoodHistory(req.user.id, days);
    res.json({
      success: true,
      data: history,
      message: 'Mood history retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get mood history'
    });
  }
});

// Get mood analytics
router.get('/analytics', authenticate, async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await moodService.getMoodAnalytics(req.user.id, days);
    res.json({
      success: true,
      data: analytics,
      message: 'Mood analytics retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get mood analytics'
    });
  }
});

// Detect mood patterns
router.get('/patterns', authenticate, async (req: any, res) => {
  try {
    const patterns = await moodService.detectMoodPatterns(req.user.id);
    res.json({
      success: true,
      data: patterns,
      message: 'Mood patterns analyzed successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze mood patterns'
    });
  }
});

export default router;