import { PrismaClient } from '@prisma/client';

export interface MoodData {
  mood: string;
  intensity: number;
  triggers?: string[];
  timestamp?: Date;
}

export interface MoodAnalysis {
  patterns: string[];
  recommendations: string[];
  shouldTriggerMusic: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export class MoodDetectionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async detectMood(userId: string): Promise<any> {
    try {
      // Get recent mood entries
      const recentMoods = await this.prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (recentMoods.length === 0) {
        return {
          mood_category: 'neutral',
          mood_score: 5,
          confidence: 0.5,
          analysis: 'No recent mood data available'
        };
      }

      // Calculate average mood score
      const avgIntensity = recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) / recentMoods.length;
      
      // Determine mood category
      const latestMood = recentMoods[0];
      
      return {
        mood_category: latestMood.mood,
        mood_score: latestMood.intensity,
        avg_score: avgIntensity,
        confidence: this.calculateConfidence(recentMoods),
        analysis: this.generateMoodAnalysis(recentMoods)
      };
    } catch (error) {
      console.error('Error detecting mood:', error);
      throw error;
    }
  }

  async logMood(userId: string, moodData: MoodData): Promise<any> {
    try {
      const moodEntry = await this.prisma.moodEntry.create({
        data: {
          userId,
          mood: moodData.mood,
          intensity: moodData.intensity,
          triggers: moodData.triggers ? JSON.stringify(moodData.triggers) : null,
          createdAt: moodData.timestamp || new Date()
        }
      });

      return moodEntry;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  async analyzeMoodPatterns(userId: string): Promise<MoodAnalysis> {
    try {
      const recentMoods = await this.prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30 // Last 30 entries
      });

      if (recentMoods.length < 3) {
        return {
          patterns: [],
          recommendations: ['Continue tracking your mood to get personalized insights'],
          shouldTriggerMusic: false,
          riskLevel: 'low'
        };
      }

      const patterns = [];
      const recommendations = [];
      let shouldTriggerMusic = false;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Check for declining mood trend
      const recentWeek = recentMoods.slice(0, 7);
      const previousWeek = recentMoods.slice(7, 14);

      if (recentWeek.length >= 3 && previousWeek.length >= 3) {
        const recentAvg = recentWeek.reduce((sum, mood) => sum + mood.intensity, 0) / recentWeek.length;
        const previousAvg = previousWeek.reduce((sum, mood) => sum + mood.intensity, 0) / previousWeek.length;

        if (recentAvg < previousAvg - 1.5) {
          patterns.push('declining_mood');
          recommendations.push('Consider reaching out to a trusted contact or practicing relaxation techniques');
          riskLevel = 'medium';
        }
      }

      // Check for persistent low mood
      const lowMoodCount = recentWeek.filter(mood => mood.intensity <= 4).length;
      if (lowMoodCount >= 5) {
        patterns.push('persistent_low_mood');
        recommendations.push('Your mood has been consistently low. Consider professional support');
        riskLevel = 'high';
        shouldTriggerMusic = true;
      }

      // Check for severe mood entry
      const severeMood = recentMoods.find(mood => 
        mood.intensity <= 3 && ['sad', 'anxious', 'angry', 'stressed'].includes(mood.mood)
      );
      if (severeMood) {
        shouldTriggerMusic = true;
        recommendations.push('Try listening to some calming music or practice breathing exercises');
      }

      // Check for mood volatility
      const intensities = recentWeek.map(mood => mood.intensity);
      const variance = this.calculateVariance(intensities);
      if (variance > 4) {
        patterns.push('mood_volatility');
        recommendations.push('Your mood has been quite variable. Try maintaining consistent routines');
      }

      return {
        patterns,
        recommendations,
        shouldTriggerMusic,
        riskLevel
      };
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
      return {
        patterns: [],
        recommendations: ['Unable to analyze patterns at this time'],
        shouldTriggerMusic: false,
        riskLevel: 'low'
      };
    }
  }

  private calculateConfidence(moods: any[]): number {
    if (moods.length < 3) return 0.3;
    if (moods.length < 7) return 0.6;
    return 0.8;
  }

  private generateMoodAnalysis(moods: any[]): string {
    const avgIntensity = moods.reduce((sum, mood) => sum + mood.intensity, 0) / moods.length;
    
    if (avgIntensity >= 7) return 'Your mood appears to be generally positive';
    if (avgIntensity >= 5) return 'Your mood appears to be stable';
    if (avgIntensity >= 3) return 'Your mood shows some concerning patterns';
    return 'Your mood indicates you may benefit from additional support';
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
}