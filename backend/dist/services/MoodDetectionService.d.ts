import Database from '../models/Database';
import { MusicPreferencesService } from './MusicPreferencesService';
import { MoodCategory, MoodDetectionResult } from '../types';
export declare class MoodDetectionService {
    private db;
    private musicService;
    constructor(database: Database, musicPreferencesService: MusicPreferencesService);
    /**
     * Analyze user's recent activities and detect mood patterns
     */
    detectMood(userId: number): Promise<MoodDetectionResult>;
    /**
     * Manual mood logging by user
     */
    logMood(userId: number, moodScore: number, moodCategory: MoodCategory, activity?: string, notes?: string): Promise<number>;
    /**
     * Automatic mood detection based on user behavior patterns
     */
    automaticMoodDetection(userId: number, behaviorData: any): Promise<MoodDetectionResult>;
    /**
     * Get recent mood logs for a user
     */
    private getRecentMoodLogs;
    /**
     * Analyze mood patterns from recent logs
     */
    private analyzeMoodPattern;
    /**
     * Analyze behavior data to detect mood (placeholder for future ML integration)
     */
    private analyzeBehaviorForMood;
    /**
     * Log automatically detected mood
     */
    private logAutomaticMood;
    /**
     * Calculate confidence based on mood consistency and recency
     */
    private calculateConfidence;
    /**
     * Determine energy level based on mood category and score
     */
    private determineEnergyLevel;
    /**
     * Get mood statistics for a user
     */
    getMoodStatistics(userId: number, days?: number): Promise<any>;
}
//# sourceMappingURL=MoodDetectionService.d.ts.map