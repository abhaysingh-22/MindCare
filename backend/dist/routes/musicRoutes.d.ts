import { Router } from 'express';
import { MusicPreferencesService } from '../services/MusicPreferencesService';
import { MoodDetectionService } from '../services/MoodDetectionService';
import { MusicStreamingService } from '../services/MusicStreamingService';
export declare class MusicRoutes {
    private router;
    private musicService;
    private moodService;
    private streamingService;
    constructor(musicService: MusicPreferencesService, moodService: MoodDetectionService, streamingService: MusicStreamingService);
    private setupRoutes;
    /**
     * Save user music preferences
     * POST /api/music/preferences
     */
    private savePreferences;
    /**
     * Get user music preferences
     * GET /api/music/preferences/:userId
     */
    private getUserPreferences;
    /**
     * Update user music preferences
     * PUT /api/music/preferences/:userId
     */
    private updatePreferences;
    /**
     * Remove a specific preference
     * DELETE /api/music/preferences/:userId/:preferenceId
     */
    private removePreference;
    /**
     * Log user mood manually
     * POST /api/music/mood/log
     */
    private logMood;
    /**
     * Detect user mood based on history
     * GET /api/music/mood/detect/:userId
     */
    private detectMood;
    /**
     * Get mood statistics for a user
     * GET /api/music/mood/statistics/:userId
     */
    private getMoodStatistics;
    /**
     * Auto-detect mood based on behavior
     * POST /api/music/mood/auto-detect
     */
    private autoDetectMood;
    /**
     * Get music recommendations based on mood and preferences
     * POST /api/music/recommendations
     */
    private getRecommendations;
    /**
     * Get curated music for a specific mood
     * GET /api/music/curated/:mood
     */
    private getCuratedMusic;
    /**
     * Trigger music playback based on detected mood
     * POST /api/music/play
     */
    private playMusic;
    /**
     * Search Spotify for tracks
     * GET /api/music/search/spotify
     */
    private searchSpotify;
    /**
     * Search YouTube for tracks
     * GET /api/music/search/youtube
     */
    private searchYouTube;
    /**
     * Create a Spotify playlist
     * POST /api/music/playlist/create
     */
    private createPlaylist;
    /**
     * Start a music session
     * POST /api/music/session/start
     */
    private startMusicSession;
    /**
     * Submit feedback for a music session
     * POST /api/music/session/feedback
     */
    private submitFeedback;
    getRouter(): Router;
}
//# sourceMappingURL=musicRoutes.d.ts.map