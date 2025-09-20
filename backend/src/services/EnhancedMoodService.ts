import { PrismaClient } from '@prisma/client';

export interface MoodEntryData {
  mood: string;
  intensity: number;
  triggers?: string[];
  notes?: string;
  location?: string;
  weather?: string;
}

export interface MoodAnalytics {
  averageMood: number;
  moodDistribution: { [key: string]: number };
  weeklyTrend: { date: string; averageMood: number }[];
  commonTriggers: string[];
  bestTimeOfDay: string;
  worstTimeOfDay: string;
}

export class EnhancedMoodService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async logMood(userId: string, moodData: MoodEntryData): Promise<any> {
    try {
      // Create mood entry
      const moodEntry = await this.prisma.moodEntry.create({
        data: {
          userId,
          mood: moodData.mood,
          intensity: moodData.intensity,
          triggers: moodData.triggers ? JSON.stringify(moodData.triggers) : null,
          notes: moodData.notes,
          location: moodData.location,
          weather: moodData.weather
        }
      });

      // Update mood logging streak
      await this.updateMoodStreak(userId);

      // Check for achievements
      await this.checkMoodAchievements(userId);

      // Trigger music recommendation if mood is poor
      if (moodData.intensity <= 4 || ['sad', 'anxious', 'angry', 'stressed'].includes(moodData.mood)) {
        // This would trigger the music service
        await this.triggerMoodBasedMusic(userId, moodData.mood);
      }

      return moodEntry;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  async getMoodHistory(userId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodEntries = await this.prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return moodEntries.map(entry => ({
        ...entry,
        triggers: entry.triggers ? JSON.parse(entry.triggers) : []
      }));
    } catch (error) {
      console.error('Error getting mood history:', error);
      throw error;
    }
  }

  async getMoodAnalytics(userId: string, days: number = 30): Promise<MoodAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodEntries = await this.prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (moodEntries.length === 0) {
        return {
          averageMood: 0,
          moodDistribution: {},
          weeklyTrend: [],
          commonTriggers: [],
          bestTimeOfDay: '',
          worstTimeOfDay: ''
        };
      }

      // Calculate average mood
      const averageMood = moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length;

      // Calculate mood distribution
      const moodDistribution: { [key: string]: number } = {};
      moodEntries.forEach(entry => {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
      });

      // Calculate weekly trend
      const weeklyData: { [key: string]: { sum: number; count: number } } = {};
      moodEntries.forEach(entry => {
        const date = entry.createdAt.toISOString().split('T')[0];
        if (!weeklyData[date]) {
          weeklyData[date] = { sum: 0, count: 0 };
        }
        weeklyData[date].sum += entry.intensity;
        weeklyData[date].count += 1;
      });

      const weeklyTrend = Object.entries(weeklyData).map(([date, data]) => ({
        date,
        averageMood: data.sum / data.count
      }));

      // Calculate common triggers
      const allTriggers: string[] = [];
      moodEntries.forEach(entry => {
        if (entry.triggers) {
          const triggers = JSON.parse(entry.triggers);
          allTriggers.push(...triggers);
        }
      });

      const triggerCounts: { [key: string]: number } = {};
      allTriggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });

      const commonTriggers = Object.entries(triggerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([trigger]) => trigger);

      // Calculate best/worst time of day
      const hourlyMoods: { [key: number]: { sum: number; count: number } } = {};
      moodEntries.forEach(entry => {
        const hour = entry.createdAt.getHours();
        if (!hourlyMoods[hour]) {
          hourlyMoods[hour] = { sum: 0, count: 0 };
        }
        hourlyMoods[hour].sum += entry.intensity;
        hourlyMoods[hour].count += 1;
      });

      const hourlyAverages = Object.entries(hourlyMoods).map(([hour, data]) => ({
        hour: parseInt(hour),
        average: data.sum / data.count
      }));

      const bestHour = hourlyAverages.reduce((best, current) => 
        current.average > best.average ? current : best
      );

      const worstHour = hourlyAverages.reduce((worst, current) => 
        current.average < worst.average ? current : worst
      );

      const formatHour = (hour: number) => {
        if (hour === 0) return '12:00 AM';
        if (hour < 12) return `${hour}:00 AM`;
        if (hour === 12) return '12:00 PM';
        return `${hour - 12}:00 PM`;
      };

      return {
        averageMood,
        moodDistribution,
        weeklyTrend,
        commonTriggers,
        bestTimeOfDay: formatHour(bestHour.hour),
        worstTimeOfDay: formatHour(worstHour.hour)
      };
    } catch (error) {
      console.error('Error getting mood analytics:', error);
      throw error;
    }
  }

  async detectMoodPatterns(userId: string): Promise<any> {
    try {
      const moodEntries = await this.prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100 // Last 100 entries
      });

      if (moodEntries.length < 5) {
        return { patterns: [], recommendations: [] };
      }

      const patterns = [];
      const recommendations = [];

      // Check for declining mood trend
      const recentEntries = moodEntries.slice(0, 7);
      const olderEntries = moodEntries.slice(7, 14);

      if (recentEntries.length >= 3 && olderEntries.length >= 3) {
        const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.intensity, 0) / recentEntries.length;
        const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.intensity, 0) / olderEntries.length;

        if (recentAvg < olderAvg - 1) {
          patterns.push('declining_mood');
          recommendations.push('Consider reaching out to a trusted contact or practicing relaxation techniques.');
        }
      }

      // Check for consistent low mood
      const lowMoodCount = recentEntries.filter(entry => entry.intensity <= 4).length;
      if (lowMoodCount >= 5) {
        patterns.push('persistent_low_mood');
        recommendations.push('You\'ve been experiencing low mood consistently. Consider professional support.');
      }

      // Check for mood volatility
      const intensities = recentEntries.map(entry => entry.intensity);
      const variance = this.calculateVariance(intensities);
      if (variance > 6) {
        patterns.push('mood_volatility');
        recommendations.push('Your mood has been quite variable. Try maintaining consistent daily routines.');
      }

      return { patterns, recommendations };
    } catch (error) {
      console.error('Error detecting mood patterns:', error);
      throw error;
    }
  }

  private async updateMoodStreak(userId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const streak = await this.prisma.streak.findFirst({
        where: {
          userId,
          type: 'mood_logging'
        }
      });

      if (!streak) return;

      // Check if user logged mood today
      const todayEntry = await this.prisma.moodEntry.findFirst({
        where: {
          userId,
          createdAt: {
            gte: today
          }
        }
      });

      if (todayEntry) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayEntry = await this.prisma.moodEntry.findFirst({
          where: {
            userId,
            createdAt: {
              gte: yesterday,
              lt: today
            }
          }
        });

        const newCount = yesterdayEntry ? streak.count + 1 : 1;
        const newMaxCount = Math.max(newCount, streak.maxCount);

        await this.prisma.streak.update({
          where: { id: streak.id },
          data: {
            count: newCount,
            maxCount: newMaxCount,
            lastUpdate: new Date(),
            isActive: true
          }
        });
      }
    } catch (error) {
      console.error('Error updating mood streak:', error);
    }
  }

  private async checkMoodAchievements(userId: string): Promise<void> {
    try {
      const moodCount = await this.prisma.moodEntry.count({
        where: { userId }
      });

      const achievements = [];

      if (moodCount === 1) {
        achievements.push({
          type: 'first_mood_log',
          title: 'First Step',
          description: 'Logged your first mood entry',
          points: 10
        });
      }

      if (moodCount === 7) {
        achievements.push({
          type: 'week_logger',
          title: 'Week Warrior',
          description: 'Logged mood for 7 days',
          points: 50
        });
      }

      if (moodCount === 30) {
        achievements.push({
          type: 'month_logger',
          title: 'Monthly Master',
          description: 'Logged mood for 30 days',
          points: 100
        });
      }

      for (const achievement of achievements) {
        const existing = await this.prisma.achievement.findFirst({
          where: {
            userId,
            type: achievement.type
          }
        });

        if (!existing) {
          await this.prisma.achievement.create({
            data: {
              userId,
              ...achievement
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking mood achievements:', error);
    }
  }

  private async triggerMoodBasedMusic(userId: string, mood: string): Promise<void> {
    // This would integrate with the existing music service
    console.log(`Triggering mood-based music for user ${userId} with mood ${mood}`);
    // Implementation would call MusicPreferencesService to get recommendations
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
}