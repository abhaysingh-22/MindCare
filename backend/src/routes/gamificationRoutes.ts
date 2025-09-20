import express from 'express';
import { GamificationService } from '../services/GamificationService';
import { AuthService } from '../services/AuthService';

const router = express.Router();
const gamificationService = new GamificationService();
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

// Get user progress
router.get('/progress', authenticate, async (req: any, res) => {
  try {
    const progress = await gamificationService.getUserProgress(req.user.id);
    res.json({
      success: true,
      data: progress,
      message: 'User progress retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user progress'
    });
  }
});

// Update streak
router.post('/streaks/:streakType', authenticate, async (req: any, res) => {
  try {
    const streak = await gamificationService.updateStreak(req.user.id, req.params.streakType);
    res.json({
      success: true,
      data: streak,
      message: 'Streak updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update streak'
    });
  }
});

// Unlock achievement
router.post('/achievements', authenticate, async (req: any, res) => {
  try {
    const achievement = await gamificationService.unlockAchievement(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: achievement,
      message: 'Achievement unlocked successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to unlock achievement'
    });
  }
});

// Get available achievements
router.get('/achievements/available', async (req, res) => {
  try {
    const achievements = await gamificationService.getAvailableAchievements();
    res.json({
      success: true,
      data: achievements,
      message: 'Available achievements retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get available achievements'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const type = req.query.type as string || 'points';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationService.getLeaderboard(type, limit);
    res.json({
      success: true,
      data: leaderboard,
      message: 'Leaderboard retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get leaderboard'
    });
  }
});

// Get user rank
router.get('/rank', authenticate, async (req: any, res) => {
  try {
    const rank = await gamificationService.getUserRank(req.user.id);
    res.json({
      success: true,
      data: rank,
      message: 'User rank retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user rank'
    });
  }
});

// Break streak (for testing or manual adjustment)
router.delete('/streaks/:streakType', authenticate, async (req: any, res) => {
  try {
    await gamificationService.breakStreak(req.user.id, req.params.streakType);
    res.json({
      success: true,
      message: 'Streak reset successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset streak'
    });
  }
});

export default router;