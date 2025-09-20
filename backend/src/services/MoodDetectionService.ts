import Database from '../models/Database';
import { MusicPreferencesService } from './MusicPreferencesService';
import { 
  MoodLog, 
  MoodCategory, 
  MoodDetectionResult,
  MusicTrack
} from '../types';

export class MoodDetectionService {
  private db: Database;
  private musicService: MusicPreferencesService;

  constructor(database: Database, musicPreferencesService: MusicPreferencesService) {
    this.db = database;
    this.musicService = musicPreferencesService;
  }

  /**
   * Analyze user's recent activities and detect mood patterns
   */
  async detectMood(userId: number): Promise<MoodDetectionResult> {
    const recentMoods = await this.getRecentMoodLogs(userId, 7); // Last 7 days
    const currentMood = await this.analyzeMoodPattern(recentMoods);
    const recommendations = await this.musicService.getRecommendations(
      userId, 
      currentMood.mood_category, 
      currentMood.energy_level
    );

    return {
      mood_category: currentMood.mood_category,
      mood_score: currentMood.mood_score,
      confidence: currentMood.confidence,
      suggested_tracks: recommendations
    };
  }

  /**
   * Manual mood logging by user
   */
  async logMood(
    userId: number, 
    moodScore: number, 
    moodCategory: MoodCategory,
    activity?: string,
    notes?: string
  ): Promise<number> {
    const database = this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO mood_logs (user_id, mood_score, mood_category, activity, notes, detected_automatically)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, moodScore, moodCategory, activity || null, notes || null, false],
        function(this: any, err: any) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Automatic mood detection based on user behavior patterns
   */
  async automaticMoodDetection(userId: number, behaviorData: any): Promise<MoodDetectionResult> {
    // Analyze behavioral patterns (this would integrate with actual behavior tracking)
    const detectedMood = this.analyzeBehaviorForMood(behaviorData);
    
    // Log the automatically detected mood
    await this.logAutomaticMood(userId, detectedMood);
    
    // Get music recommendations
    const recommendations = await this.musicService.getRecommendations(
      userId, 
      detectedMood.mood_category,
      detectedMood.energy_level
    );

    return {
      mood_category: detectedMood.mood_category,
      mood_score: detectedMood.mood_score,
      confidence: detectedMood.confidence,
      suggested_tracks: recommendations
    };
  }

  /**
   * Get recent mood logs for a user
   */
  private async getRecentMoodLogs(userId: number, days: number): Promise<MoodLog[]> {
    const database = this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.all(
        `SELECT * FROM mood_logs 
         WHERE user_id = ? AND timestamp >= datetime('now', '-${days} days')
         ORDER BY timestamp DESC`,
        [userId],
        (err: any, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows as MoodLog[]);
        }
      );
    });
  }

  /**
   * Analyze mood patterns from recent logs
   */
  private async analyzeMoodPattern(moodLogs: MoodLog[]): Promise<{
    mood_category: MoodCategory;
    mood_score: number;
    confidence: number;
    energy_level: number;
  }> {
    if (moodLogs.length === 0) {
      // Default mood when no data available
      return {
        mood_category: 'calm',
        mood_score: 5,
        confidence: 0.3,
        energy_level: 5
      };
    }

    // Calculate average mood score
    const avgMoodScore = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
    
    // Find most frequent mood category
    const moodFrequency: Record<string, number> = {};
    moodLogs.forEach(log => {
      moodFrequency[log.mood_category] = (moodFrequency[log.mood_category] || 0) + 1;
    });
    
    const mostFrequentMood = Object.keys(moodFrequency).reduce((a, b) => 
      moodFrequency[a] > moodFrequency[b] ? a : b
    ) as MoodCategory;

    // Calculate confidence based on consistency and recency
    const confidence = this.calculateConfidence(moodLogs, mostFrequentMood);
    
    // Determine energy level based on mood category and score
    const energyLevel = this.determineEnergyLevel(mostFrequentMood, avgMoodScore);

    return {
      mood_category: mostFrequentMood,
      mood_score: Math.round(avgMoodScore),
      confidence,
      energy_level: energyLevel
    };
  }

  /**
   * Analyze behavior data to detect mood (placeholder for future ML integration)
   */
  private analyzeBehaviorForMood(behaviorData: any): {
    mood_category: MoodCategory;
    mood_score: number;
    confidence: number;
    energy_level: number;
  } {
    // This is a simplified mood detection based on behavior patterns
    // In a real implementation, this would use ML models or more sophisticated analysis
    
    const {
      appUsageTime = 0,
      lastActivityTime = Date.now(),
      musicListeningHistory = [],
      timeOfDay = new Date().getHours()
    } = behaviorData;

    let moodCategory: MoodCategory = 'calm';
    let moodScore = 5;
    let confidence = 0.6;
    let energyLevel = 5;

    // Time-based mood detection
    if (timeOfDay >= 6 && timeOfDay <= 10) {
      // Morning - generally more energetic
      moodCategory = 'energetic';
      energyLevel = 7;
      moodScore = 6;
    } else if (timeOfDay >= 11 && timeOfDay <= 17) {
      // Afternoon - productive/motivated
      moodCategory = 'motivated';
      energyLevel = 6;
      moodScore = 7;
    } else if (timeOfDay >= 18 && timeOfDay <= 22) {
      // Evening - calm/relaxed
      moodCategory = 'calm';
      energyLevel = 4;
      moodScore = 6;
    } else {
      // Late night - might be anxious or peaceful
      moodCategory = Math.random() > 0.5 ? 'anxious' : 'peaceful';
      energyLevel = 3;
      moodScore = 4;
    }

    // App usage patterns
    if (appUsageTime > 120) { // More than 2 hours
      // Heavy usage might indicate seeking comfort or distraction
      if (moodScore > 5) {
        moodScore -= 1; // Slight decrease
        if (['calm', 'peaceful'].includes(moodCategory)) {
          moodCategory = 'anxious';
        }
      }
    }

    // Recent music preferences (if available)
    if (musicListeningHistory.length > 0) {
      const recentGenres = musicListeningHistory.slice(-5);
      if (recentGenres.includes('sad') || recentGenres.includes('melancholy')) {
        moodCategory = 'sad';
        moodScore = Math.max(1, moodScore - 2);
        energyLevel = Math.max(1, energyLevel - 2);
      } else if (recentGenres.includes('upbeat') || recentGenres.includes('dance')) {
        moodCategory = 'happy';
        moodScore = Math.min(10, moodScore + 1);
        energyLevel = Math.min(10, energyLevel + 2);
      }
    }

    return {
      mood_category: moodCategory,
      mood_score: moodScore,
      confidence,
      energy_level: energyLevel
    };
  }

  /**
   * Log automatically detected mood
   */
  private async logAutomaticMood(
    userId: number, 
    detectedMood: {
      mood_category: MoodCategory;
      mood_score: number;
      confidence: number;
    }
  ): Promise<number> {
    const database = this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO mood_logs (user_id, mood_score, mood_category, detected_automatically, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId, 
          detectedMood.mood_score, 
          detectedMood.mood_category, 
          true,
          `Auto-detected with ${Math.round(detectedMood.confidence * 100)}% confidence`
        ],
        function(this: any, err: any) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Calculate confidence based on mood consistency and recency
   */
  private calculateConfidence(moodLogs: MoodLog[], predictedMood: MoodCategory): number {
    if (moodLogs.length === 0) return 0.3;

    // Check consistency of recent moods
    const recentLogs = moodLogs.slice(0, 5); // Last 5 logs
    const consistentMoods = recentLogs.filter(log => log.mood_category === predictedMood).length;
    
    const consistencyScore = consistentMoods / recentLogs.length;
    
    // Factor in recency (more recent logs have higher weight)
    const now = new Date().getTime();
    const recentnessScore = recentLogs.reduce((score, log, index) => {
      const logTime = new Date(log.timestamp).getTime();
      const timeDiff = now - logTime;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      const weight = Math.max(0, 1 - (daysDiff / 7)); // Weight decreases over 7 days
      return score + (weight * (recentLogs.length - index) / recentLogs.length);
    }, 0) / recentLogs.length;

    return Math.min(0.95, Math.max(0.3, (consistencyScore * 0.7) + (recentnessScore * 0.3)));
  }

  /**
   * Determine energy level based on mood category and score
   */
  private determineEnergyLevel(moodCategory: MoodCategory, moodScore: number): number {
    const baseEnergyLevels: Record<MoodCategory, number> = {
      happy: 7,
      sad: 3,
      calm: 4,
      energetic: 9,
      anxious: 6,
      angry: 8,
      peaceful: 2,
      motivated: 8,
      nostalgic: 4,
      romantic: 5
    };

    const baseLevel = baseEnergyLevels[moodCategory] || 5;
    
    // Adjust based on mood score
    const adjustment = (moodScore - 5) * 0.5; // -2.5 to +2.5 adjustment
    
    return Math.max(1, Math.min(10, Math.round(baseLevel + adjustment)));
  }

  /**
   * Get mood statistics for a user
   */
  async getMoodStatistics(userId: number, days: number = 30): Promise<any> {
    const moodLogs = await this.getRecentMoodLogs(userId, days);
    
    if (moodLogs.length === 0) {
      return {
        averageMood: 5,
        moodTrend: 'stable',
        dominantMood: 'calm',
        moodDistribution: {}
      };
    }

    const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
    
    // Calculate mood distribution
    const moodDistribution: Record<string, number> = {};
    moodLogs.forEach(log => {
      moodDistribution[log.mood_category] = (moodDistribution[log.mood_category] || 0) + 1;
    });

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(moodLogs.length / 2);
    const firstHalf = moodLogs.slice(midPoint);
    const secondHalf = moodLogs.slice(0, midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.mood_score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.mood_score, 0) / secondHalf.length;
    
    let trend = 'stable';
    if (secondHalfAvg - firstHalfAvg > 0.5) trend = 'improving';
    else if (firstHalfAvg - secondHalfAvg > 0.5) trend = 'declining';

    const dominantMood = Object.keys(moodDistribution).reduce((a, b) => 
      moodDistribution[a] > moodDistribution[b] ? a : b
    );

    return {
      averageMood: Math.round(avgMood * 10) / 10,
      moodTrend: trend,
      dominantMood,
      moodDistribution,
      totalLogs: moodLogs.length
    };
  }
}