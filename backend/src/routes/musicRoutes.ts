import { Router, Request, Response } from 'express';
import { MusicPreferencesService } from '../services/MusicPreferencesService';
import { MoodDetectionService } from '../services/MoodDetectionService';
import { MusicStreamingService } from '../services/MusicStreamingService';
import { 
  MoodCategory, 
  MusicPreferenceRequest,
  PlaybackRequest
} from '../types';

export class MusicRoutes {
  private router: Router;
  private musicService: MusicPreferencesService;
  private moodService: MoodDetectionService;
  private streamingService: MusicStreamingService;

  constructor(
    musicService: MusicPreferencesService,
    moodService: MoodDetectionService,
    streamingService: MusicStreamingService
  ) {
    this.router = Router();
    this.musicService = musicService;
    this.moodService = moodService;
    this.streamingService = streamingService;
    this.setupRoutes();
  }

  private setupRoutes() {
    // Music Preferences Routes
    this.router.post('/preferences', this.savePreferences.bind(this));
    this.router.get('/preferences/:userId', this.getUserPreferences.bind(this));
    this.router.put('/preferences/:userId', this.updatePreferences.bind(this));
    this.router.delete('/preferences/:userId/:preferenceId', this.removePreference.bind(this));

    // Mood Detection Routes
    this.router.post('/mood/log', this.logMood.bind(this));
    this.router.get('/mood/detect/:userId', this.detectMood.bind(this));
    this.router.get('/mood/statistics/:userId', this.getMoodStatistics.bind(this));
    this.router.post('/mood/auto-detect', this.autoDetectMood.bind(this));

    // Music Recommendations Routes
    this.router.post('/recommendations', this.getRecommendations.bind(this));
    this.router.get('/curated/:mood', this.getCuratedMusic.bind(this));
    this.router.post('/play', this.playMusic.bind(this));

    // Music Streaming Routes
    this.router.get('/search/spotify', this.searchSpotify.bind(this));
    this.router.get('/search/youtube', this.searchYouTube.bind(this));
    this.router.post('/playlist/create', this.createPlaylist.bind(this));

    // Music Session Tracking
    this.router.post('/session/start', this.startMusicSession.bind(this));
    this.router.post('/session/feedback', this.submitFeedback.bind(this));
  }

  /**
   * Save user music preferences
   * POST /api/music/preferences
   */
  private async savePreferences(req: Request, res: Response) {
    try {
      const { userId, preferences }: { userId: number; preferences: MusicPreferenceRequest[] } = req.body;

      if (!userId || !preferences || !Array.isArray(preferences)) {
        return res.status(400).json({ 
          error: 'User ID and preferences array are required' 
        });
      }

      await this.musicService.savePreferences(userId, preferences);
      
      res.json({ 
        success: true, 
        message: 'Preferences saved successfully' 
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      res.status(500).json({ 
        error: 'Failed to save preferences' 
      });
    }
  }

  /**
   * Get user music preferences
   * GET /api/music/preferences/:userId
   */
  private async getUserPreferences(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId) {
        return res.status(400).json({ 
          error: 'Valid user ID is required' 
        });
      }

      const preferences = await this.musicService.getUserPreferences(userId);
      
      res.json({ 
        preferences 
      });
    } catch (error) {
      console.error('Error getting preferences:', error);
      res.status(500).json({ 
        error: 'Failed to get preferences' 
      });
    }
  }

  /**
   * Update user music preferences
   * PUT /api/music/preferences/:userId
   */
  private async updatePreferences(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { genreFeedback }: { genreFeedback: Record<string, number> } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          error: 'Valid user ID is required' 
        });
      }

      await this.musicService.updatePreferenceWeights(userId, genreFeedback);
      
      res.json({ 
        success: true, 
        message: 'Preferences updated successfully' 
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ 
        error: 'Failed to update preferences' 
      });
    }
  }

  /**
   * Remove a specific preference
   * DELETE /api/music/preferences/:userId/:preferenceId
   */
  private async removePreference(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const preferenceId = parseInt(req.params.preferenceId);

      if (!userId || !preferenceId) {
        return res.status(400).json({ 
          error: 'Valid user ID and preference ID are required' 
        });
      }

      await this.musicService.removePreference(userId, preferenceId);
      
      res.json({ 
        success: true, 
        message: 'Preference removed successfully' 
      });
    } catch (error) {
      console.error('Error removing preference:', error);
      res.status(500).json({ 
        error: 'Failed to remove preference' 
      });
    }
  }

  /**
   * Log user mood manually
   * POST /api/music/mood/log
   */
  private async logMood(req: Request, res: Response) {
    try {
      const { 
        userId, 
        moodScore, 
        moodCategory, 
        activity, 
        notes 
      }: {
        userId: number;
        moodScore: number;
        moodCategory: MoodCategory;
        activity?: string;
        notes?: string;
      } = req.body;

      if (!userId || !moodScore || !moodCategory) {
        return res.status(400).json({ 
          error: 'User ID, mood score, and mood category are required' 
        });
      }

      if (moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ 
          error: 'Mood score must be between 1 and 10' 
        });
      }

      const logId = await this.moodService.logMood(
        userId, 
        moodScore, 
        moodCategory, 
        activity, 
        notes
      );
      
      res.json({ 
        success: true, 
        logId,
        message: 'Mood logged successfully' 
      });
    } catch (error) {
      console.error('Error logging mood:', error);
      res.status(500).json({ 
        error: 'Failed to log mood' 
      });
    }
  }

  /**
   * Detect user mood based on history
   * GET /api/music/mood/detect/:userId
   */
  private async detectMood(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId) {
        return res.status(400).json({ 
          error: 'Valid user ID is required' 
        });
      }

      const moodResult = await this.moodService.detectMood(userId);
      
      res.json(moodResult);
    } catch (error) {
      console.error('Error detecting mood:', error);
      res.status(500).json({ 
        error: 'Failed to detect mood' 
      });
    }
  }

  /**
   * Get mood statistics for a user
   * GET /api/music/mood/statistics/:userId
   */
  private async getMoodStatistics(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const days = parseInt(req.query.days as string) || 30;

      if (!userId) {
        return res.status(400).json({ 
          error: 'Valid user ID is required' 
        });
      }

      const statistics = await this.moodService.getMoodStatistics(userId, days);
      
      res.json(statistics);
    } catch (error) {
      console.error('Error getting mood statistics:', error);
      res.status(500).json({ 
        error: 'Failed to get mood statistics' 
      });
    }
  }

  /**
   * Auto-detect mood based on behavior
   * POST /api/music/mood/auto-detect
   */
  private async autoDetectMood(req: Request, res: Response) {
    try {
      const { userId, behaviorData }: { userId: number; behaviorData: any } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID is required' 
        });
      }

      const moodResult = await this.moodService.automaticMoodDetection(userId, behaviorData || {});
      
      res.json(moodResult);
    } catch (error) {
      console.error('Error auto-detecting mood:', error);
      res.status(500).json({ 
        error: 'Failed to auto-detect mood' 
      });
    }
  }

  /**
   * Get music recommendations based on mood and preferences
   * POST /api/music/recommendations
   */
  private async getRecommendations(req: Request, res: Response) {
    try {
      const { 
        user_id: userId, 
        mood_category: moodCategory, 
        energy_level: energyLevel, 
        genre_preference: genrePreference 
      }: PlaybackRequest = req.body;

      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID is required' 
        });
      }

      let recommendations;
      if (moodCategory) {
        recommendations = await this.musicService.getRecommendations(
          userId, 
          moodCategory, 
          energyLevel
        );
      } else {
        // Auto-detect mood if not provided
        const moodResult = await this.moodService.detectMood(userId);
        recommendations = moodResult.suggested_tracks;
      }
      
      res.json({ 
        recommendations 
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ 
        error: 'Failed to get recommendations' 
      });
    }
  }

  /**
   * Get curated music for a specific mood
   * GET /api/music/curated/:mood
   */
  private async getCuratedMusic(req: Request, res: Response) {
    try {
      const mood = req.params.mood as MoodCategory;
      const genre = req.query.genre as string;
      const energyLevel = req.query.energyLevel ? parseInt(req.query.energyLevel as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const tracks = await this.streamingService.getCuratedTracks(
        mood, 
        genre, 
        energyLevel, 
        limit
      );
      
      res.json({ 
        tracks,
        mood,
        genre,
        energyLevel
      });
    } catch (error) {
      console.error('Error getting curated music:', error);
      res.status(500).json({ 
        error: 'Failed to get curated music' 
      });
    }
  }

  /**
   * Trigger music playback based on detected mood
   * POST /api/music/play
   */
  private async playMusic(req: Request, res: Response) {
    try {
      const { userId }: { userId: number } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID is required' 
        });
      }

      // Detect current mood
      const moodResult = await this.moodService.detectMood(userId);
      
      // Get curated tracks based on mood
      const tracks = await this.streamingService.getCuratedTracks(
        moodResult.mood_category,
        undefined, // Let service determine genre based on preferences
        undefined, // Let service determine energy level
        10 // Limit to 10 tracks for immediate playback
      );

      res.json({
        mood: moodResult.mood_category,
        moodScore: moodResult.mood_score,
        confidence: moodResult.confidence,
        playlist: tracks,
        message: `Playing ${moodResult.mood_category} music based on your current mood`
      });
    } catch (error) {
      console.error('Error playing music:', error);
      res.status(500).json({ 
        error: 'Failed to play music' 
      });
    }
  }

  /**
   * Search Spotify for tracks
   * GET /api/music/search/spotify
   */
  private async searchSpotify(req: Request, res: Response) {
    try {
      const mood = req.query.mood as MoodCategory;
      const genre = req.query.genre as string;
      const energyLevel = req.query.energyLevel ? parseInt(req.query.energyLevel as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      if (!mood) {
        return res.status(400).json({ 
          error: 'Mood parameter is required' 
        });
      }

      const tracks = await this.streamingService.searchSpotifyTracks(
        mood, 
        genre, 
        energyLevel, 
        limit
      );
      
      res.json({ 
        tracks 
      });
    } catch (error) {
      console.error('Error searching Spotify:', error);
      res.status(500).json({ 
        error: 'Failed to search Spotify' 
      });
    }
  }

  /**
   * Search YouTube for tracks
   * GET /api/music/search/youtube
   */
  private async searchYouTube(req: Request, res: Response) {
    try {
      const mood = req.query.mood as MoodCategory;
      const genre = req.query.genre as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!mood) {
        return res.status(400).json({ 
          error: 'Mood parameter is required' 
        });
      }

      const tracks = await this.streamingService.searchYouTubeTracks(
        mood, 
        genre, 
        limit
      );
      
      res.json({ 
        tracks 
      });
    } catch (error) {
      console.error('Error searching YouTube:', error);
      res.status(500).json({ 
        error: 'Failed to search YouTube' 
      });
    }
  }

  /**
   * Create a Spotify playlist
   * POST /api/music/playlist/create
   */
  private async createPlaylist(req: Request, res: Response) {
    try {
      const { 
        userAccessToken, 
        playlistName, 
        trackIds 
      }: {
        userAccessToken: string;
        playlistName: string;
        trackIds: string[];
      } = req.body;

      if (!userAccessToken || !playlistName || !trackIds || !Array.isArray(trackIds)) {
        return res.status(400).json({ 
          error: 'User access token, playlist name, and track IDs are required' 
        });
      }

      const playlistId = await this.streamingService.createSpotifyPlaylist(
        userAccessToken, 
        playlistName, 
        trackIds
      );
      
      if (playlistId) {
        res.json({ 
          success: true, 
          playlistId,
          message: 'Playlist created successfully' 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to create playlist' 
        });
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ 
        error: 'Failed to create playlist' 
      });
    }
  }

  /**
   * Start a music session
   * POST /api/music/session/start
   */
  private async startMusicSession(req: Request, res: Response) {
    try {
      const { 
        userId, 
        trackId, 
        moodBefore 
      }: {
        userId: number;
        trackId: number;
        moodBefore: number;
      } = req.body;

      if (!userId || !trackId || !moodBefore) {
        return res.status(400).json({ 
          error: 'User ID, track ID, and mood before are required' 
        });
      }

      // This would be implemented to track music sessions
      // For now, return a session ID
      const sessionId = Date.now(); // Simple session ID generation
      
      res.json({ 
        success: true, 
        sessionId,
        message: 'Music session started' 
      });
    } catch (error) {
      console.error('Error starting music session:', error);
      res.status(500).json({ 
        error: 'Failed to start music session' 
      });
    }
  }

  /**
   * Submit feedback for a music session
   * POST /api/music/session/feedback
   */
  private async submitFeedback(req: Request, res: Response) {
    try {
      const { 
        sessionId, 
        moodAfter, 
        feedbackRating 
      }: {
        sessionId: number;
        moodAfter: number;
        feedbackRating: number;
      } = req.body;

      if (!sessionId || !moodAfter || !feedbackRating) {
        return res.status(400).json({ 
          error: 'Session ID, mood after, and feedback rating are required' 
        });
      }

      if (moodAfter < 1 || moodAfter > 10 || feedbackRating < 1 || feedbackRating > 5) {
        return res.status(400).json({ 
          error: 'Mood must be 1-10 and rating must be 1-5' 
        });
      }

      // This would be implemented to store feedback in the database
      // For now, just acknowledge the feedback
      
      res.json({ 
        success: true, 
        message: 'Feedback submitted successfully' 
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ 
        error: 'Failed to submit feedback' 
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}