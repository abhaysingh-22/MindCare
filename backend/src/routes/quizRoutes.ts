import express from 'express';
import { QuizService } from '../services/QuizService';
import { AuthService } from '../services/AuthService';

const router = express.Router();
const quizService = new QuizService();
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

// Get PHQ-9 questions
router.get('/phq9/questions', async (req, res) => {
  try {
    const questions = quizService.getPHQ9Questions();
    res.json({
      success: true,
      data: questions,
      message: 'PHQ-9 questions retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get PHQ-9 questions'
    });
  }
});

// Get GAD-7 questions
router.get('/gad7/questions', async (req, res) => {
  try {
    const questions = quizService.getGAD7Questions();
    res.json({
      success: true,
      data: questions,
      message: 'GAD-7 questions retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get GAD-7 questions'
    });
  }
});

// Get daily check-in questions
router.get('/daily-checkin/questions', async (req, res) => {
  try {
    const questions = quizService.getDailyCheckInQuestions();
    res.json({
      success: true,
      data: questions,
      message: 'Daily check-in questions retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily check-in questions'
    });
  }
});

// Submit quiz
router.post('/submit', authenticate, async (req: any, res) => {
  try {
    const { quizType, answers } = req.body;
    const result = await quizService.submitQuiz(req.user.id, quizType, answers);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Quiz submitted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit quiz'
    });
  }
});

// Get quiz history
router.get('/history', authenticate, async (req: any, res) => {
  try {
    const quizType = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await quizService.getQuizHistory(req.user.id, quizType, limit);
    res.json({
      success: true,
      data: history,
      message: 'Quiz history retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get quiz history'
    });
  }
});

// Get quiz trends
router.get('/trends/:quizType', authenticate, async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await quizService.getQuizTrends(req.user.id, req.params.quizType, days);
    res.json({
      success: true,
      data: trends,
      message: 'Quiz trends retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get quiz trends'
    });
  }
});

export default router;