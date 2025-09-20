import { PrismaClient } from '@prisma/client';

export interface StreakData {
  type: string;
  count: number;
  maxCount: number;
  isActive: boolean;
}

export interface AchievementData {
  type: string;
  title: string;
  description: string;
  points: number;
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  streaks: StreakData[];
  achievements: AchievementData[];
  nextLevelPoints: number;
}

export class GamificationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      // Get user streaks
      const streaks = await this.prisma.streak.findMany({
        where: { userId },
        select: {
          type: true,
          count: true,
          maxCount: true,
          isActive: true,
          lastUpdate: true
        }
      });

      // Get user achievements
      const achievements = await this.prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' }
      });

      // Calculate total points
      const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

      // Calculate level (every 100 points = 1 level)
      const level = Math.floor(totalPoints / 100) + 1;
      const nextLevelPoints = level * 100;

      return {
        totalPoints,
        level,
        streaks: streaks as StreakData[],
        achievements: achievements as AchievementData[],
        nextLevelPoints
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  async updateStreak(userId: string, streakType: string): Promise<StreakData> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = await this.prisma.streak.findFirst({
        where: {
          userId,
          type: streakType
        }
      });

      if (!streak) {
        // Create new streak
        streak = await this.prisma.streak.create({
          data: {
            userId,
            type: streakType,
            count: 1,
            maxCount: 1,
            isActive: true,
            lastUpdate: new Date()
          }
        });
      } else {
        // Check if streak should continue or reset
        const lastUpdate = new Date(streak.lastUpdate);
        lastUpdate.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newCount: number;
        if (lastUpdate.getTime() === yesterday.getTime()) {
          // Continue streak
          newCount = streak.count + 1;
        } else if (lastUpdate.getTime() === today.getTime()) {
          // Already updated today
          newCount = streak.count;
        } else {
          // Reset streak
          newCount = 1;
        }

        const newMaxCount = Math.max(newCount, streak.maxCount);

        streak = await this.prisma.streak.update({
          where: { id: streak.id },
          data: {
            count: newCount,
            maxCount: newMaxCount,
            lastUpdate: new Date(),
            isActive: true
          }
        });
      }

      // Check for streak achievements
      await this.checkStreakAchievements(userId, streakType, streak.count);

      return {
        type: streak.type,
        count: streak.count,
        maxCount: streak.maxCount,
        isActive: streak.isActive
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  async checkStreakAchievements(userId: string, streakType: string, currentCount: number): Promise<AchievementData[]> {
    try {
      const newAchievements: AchievementData[] = [];

      // Define streak milestones
      const milestones = [
        { count: 3, suffix: '3_day', points: 30 },
        { count: 7, suffix: 'week', points: 70 },
        { count: 14, suffix: '2_week', points: 140 },
        { count: 30, suffix: 'month', points: 300 },
        { count: 90, suffix: '3_month', points: 900 },
        { count: 365, suffix: 'year', points: 3650 }
      ];

      for (const milestone of milestones) {
        if (currentCount === milestone.count) {
          const achievementType = `${streakType}_${milestone.suffix}_streak`;
          
          // Check if achievement already exists
          const existing = await this.prisma.achievement.findFirst({
            where: {
              userId,
              type: achievementType
            }
          });

          if (!existing) {
            const achievement = await this.prisma.achievement.create({
              data: {
                userId,
                type: achievementType,
                title: `${this.formatStreakType(streakType)} ${milestone.count}-Day Streak`,
                description: `Maintained ${this.formatStreakType(streakType)} for ${milestone.count} consecutive days`,
                points: milestone.points
              }
            });

            newAchievements.push(achievement as AchievementData);
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking streak achievements:', error);
      return [];
    }
  }

  async unlockAchievement(userId: string, achievementData: AchievementData): Promise<AchievementData> {
    try {
      // Check if achievement already exists
      const existing = await this.prisma.achievement.findFirst({
        where: {
          userId,
          type: achievementData.type
        }
      });

      if (existing) {
        return existing as AchievementData;
      }

      const achievement = await this.prisma.achievement.create({
        data: {
          userId,
          ...achievementData
        }
      });

      return achievement as AchievementData;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  async getAvailableAchievements(): Promise<any[]> {
    return [
      // Mood tracking achievements
      {
        type: 'first_mood_log',
        title: 'First Steps',
        description: 'Log your first mood entry',
        points: 10,
        category: 'mood'
      },
      {
        type: 'week_mood_logger',
        title: 'Mood Tracker',
        description: 'Log mood for 7 days',
        points: 50,
        category: 'mood'
      },
      {
        type: 'month_mood_logger',
        title: 'Mood Master',
        description: 'Log mood for 30 days',
        points: 150,
        category: 'mood'
      },
      
      // Music achievements
      {
        type: 'first_playlist',
        title: 'Music Curator',
        description: 'Create your first mood-based playlist',
        points: 20,
        category: 'music'
      },
      {
        type: 'music_therapy_week',
        title: 'Sound Healer',
        description: 'Use music therapy for 7 consecutive days',
        points: 80,
        category: 'music'
      },

      // Wellness achievements
      {
        type: 'meditation_starter',
        title: 'Inner Peace',
        description: 'Complete your first meditation session',
        points: 15,
        category: 'wellness'
      },
      {
        type: 'exercise_week',
        title: 'Active Life',
        description: 'Exercise for 7 consecutive days',
        points: 100,
        category: 'wellness'
      },
      {
        type: 'sleep_week',
        title: 'Dream Keeper',
        description: 'Maintain good sleep habits for 7 days',
        points: 75,
        category: 'wellness'
      },

      // Social achievements
      {
        type: 'trusted_contact_added',
        title: 'Support Network',
        description: 'Add your first trusted contact',
        points: 25,
        category: 'social'
      },
      {
        type: 'community_helper',
        title: 'Helping Hand',
        description: 'Share encouragement with others',
        points: 40,
        category: 'social'
      },

      // Milestone achievements
      {
        type: 'app_week',
        title: 'Week Warrior',
        description: 'Use the app for 7 consecutive days',
        points: 100,
        category: 'milestone'
      },
      {
        type: 'app_month',
        title: 'Monthly Champion',
        description: 'Use the app for 30 consecutive days',
        points: 300,
        category: 'milestone'
      },
      {
        type: 'points_milestone_100',
        title: 'Century Club',
        description: 'Earn 100 points',
        points: 10,
        category: 'milestone'
      },
      {
        type: 'points_milestone_500',
        title: 'High Achiever',
        description: 'Earn 500 points',
        points: 50,
        category: 'milestone'
      },
      {
        type: 'points_milestone_1000',
        title: 'Elite Member',
        description: 'Earn 1000 points',
        points: 100,
        category: 'milestone'
      }
    ];
  }

  async checkMilestoneAchievements(userId: string): Promise<AchievementData[]> {
    try {
      const newAchievements: AchievementData[] = [];

      // Check total points milestones
      const totalPoints = await this.prisma.achievement.aggregate({
        where: { userId },
        _sum: { points: true }
      });

      const points = totalPoints._sum.points || 0;

      const pointMilestones = [100, 500, 1000, 2500, 5000];
      
      for (const milestone of pointMilestones) {
        if (points >= milestone) {
          const achievementType = `points_milestone_${milestone}`;
          
          const existing = await this.prisma.achievement.findFirst({
            where: {
              userId,
              type: achievementType
            }
          });

          if (!existing) {
            const achievement = await this.prisma.achievement.create({
              data: {
                userId,
                type: achievementType,
                title: `${milestone} Point Club`,
                description: `Earned ${milestone} total points`,
                points: Math.floor(milestone / 10)
              }
            });

            newAchievements.push(achievement as AchievementData);
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking milestone achievements:', error);
      return [];
    }
  }

  async getLeaderboard(type: string = 'points', limit: number = 10): Promise<any[]> {
    try {
      if (type === 'points') {
        // Get top users by total points
        const userPoints = await this.prisma.achievement.groupBy({
          by: ['userId'],
          _sum: {
            points: true
          },
          orderBy: {
            _sum: {
              points: 'desc'
            }
          },
          take: limit
        });

        const leaderboard = [];
        for (const entry of userPoints) {
          const user = await this.prisma.user.findUnique({
            where: { id: entry.userId },
            select: { firstName: true, lastName: true }
          });

          leaderboard.push({
            userId: entry.userId,
            name: user ? `${user.firstName} ${user.lastName[0]}.` : 'Anonymous',
            points: entry._sum.points || 0
          });
        }

        return leaderboard;
      } else if (type === 'streak') {
        // Get top users by longest streak
        const topStreaks = await this.prisma.streak.findMany({
          where: { isActive: true },
          orderBy: { maxCount: 'desc' },
          take: limit,
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        });

        return topStreaks.map(streak => ({
          userId: streak.userId,
          name: `${streak.user.firstName} ${streak.user.lastName[0]}.`,
          streakType: streak.type,
          count: streak.maxCount
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  private formatStreakType(streakType: string): string {
    const formats: { [key: string]: string } = {
      mood_logging: 'Mood Logging',
      meditation: 'Meditation',
      exercise: 'Exercise',
      sleep: 'Sleep Tracking'
    };

    return formats[streakType] || streakType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async breakStreak(userId: string, streakType: string): Promise<void> {
    try {
      await this.prisma.streak.updateMany({
        where: {
          userId,
          type: streakType
        },
        data: {
          count: 0,
          isActive: false
        }
      });
    } catch (error) {
      console.error('Error breaking streak:', error);
      throw error;
    }
  }

  async getUserRank(userId: string): Promise<{ rank: number; totalUsers: number }> {
    try {
      const userPoints = await this.prisma.achievement.aggregate({
        where: { userId },
        _sum: { points: true }
      });

      const points = userPoints._sum.points || 0;

      const betterUsers = await this.prisma.achievement.groupBy({
        by: ['userId'],
        _sum: { points: true },
        having: {
          points: {
            _sum: {
              gt: points
            }
          }
        }
      });

      const totalUsers = await this.prisma.user.count({
        where: { isActive: true }
      });

      return {
        rank: betterUsers.length + 1,
        totalUsers
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { rank: 0, totalUsers: 0 };
    }
  }
}