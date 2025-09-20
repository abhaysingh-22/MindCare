import { PrismaClient } from '@prisma/client';

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'rating' | 'multiple_choice' | 'text';
  options?: string[];
  required: boolean;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizResult {
  id: string;
  type: string;
  score: number;
  analysis: string;
  recommendations: string[];
  createdAt: Date;
}

export class QuizService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // PHQ-9 Depression Screening
  getPHQ9Questions(): QuizQuestion[] {
    return [
      {
        id: 'phq9_1',
        text: 'Little interest or pleasure in doing things',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_2',
        text: 'Feeling down, depressed, or hopeless',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_3',
        text: 'Trouble falling or staying asleep, or sleeping too much',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_4',
        text: 'Feeling tired or having little energy',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_5',
        text: 'Poor appetite or overeating',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_6',
        text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_7',
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_8',
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite being so fidgety or restless that you have been moving around a lot more than usual',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'phq9_9',
        text: 'Thoughts that you would be better off dead, or of hurting yourself',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      }
    ];
  }

  // GAD-7 Anxiety Screening
  getGAD7Questions(): QuizQuestion[] {
    return [
      {
        id: 'gad7_1',
        text: 'Feeling nervous, anxious, or on edge',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_2',
        text: 'Not being able to stop or control worrying',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_3',
        text: 'Worrying too much about different things',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_4',
        text: 'Trouble relaxing',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_5',
        text: 'Being so restless that it is hard to sit still',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_6',
        text: 'Becoming easily annoyed or irritable',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'gad7_7',
        text: 'Feeling afraid, as if something awful might happen',
        type: 'rating',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      }
    ];
  }

  // Daily Check-in Questions
  getDailyCheckInQuestions(): QuizQuestion[] {
    return [
      {
        id: 'daily_mood',
        text: 'How are you feeling today overall?',
        type: 'rating',
        options: ['Very poor', 'Poor', 'Fair', 'Good', 'Very good'],
        required: true
      },
      {
        id: 'daily_energy',
        text: 'How is your energy level today?',
        type: 'rating',
        options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
        required: true
      },
      {
        id: 'daily_sleep',
        text: 'How well did you sleep last night?',
        type: 'rating',
        options: ['Very poorly', 'Poorly', 'Fair', 'Well', 'Very well'],
        required: true
      },
      {
        id: 'daily_stress',
        text: 'How stressed do you feel today?',
        type: 'rating',
        options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
        required: true
      },
      {
        id: 'daily_activities',
        text: 'What activities did you do today that made you feel good?',
        type: 'text',
        required: false
      },
      {
        id: 'daily_challenges',
        text: 'What challenges did you face today?',
        type: 'text',
        required: false
      },
      {
        id: 'daily_gratitude',
        text: 'What are you grateful for today?',
        type: 'text',
        required: false
      }
    ];
  }

  async submitQuiz(userId: string, quizType: string, answers: QuizAnswer[]): Promise<QuizResult> {
    try {
      let score = 0;
      let analysis = '';
      let recommendations: string[] = [];

      // Calculate score and analysis based on quiz type
      if (quizType === 'phq9') {
        score = this.calculatePHQ9Score(answers);
        analysis = this.analyzePHQ9Score(score);
        recommendations = this.getPHQ9Recommendations(score, answers);
      } else if (quizType === 'gad7') {
        score = this.calculateGAD7Score(answers);
        analysis = this.analyzeGAD7Score(score);
        recommendations = this.getGAD7Recommendations(score);
      } else if (quizType === 'daily_check_in') {
        score = this.calculateDailyCheckInScore(answers);
        analysis = this.analyzeDailyCheckIn(answers);
        recommendations = this.getDailyCheckInRecommendations(answers);
      }

      // Save quiz result
      const quiz = await this.prisma.quiz.create({
        data: {
          userId,
          type: quizType,
          questions: JSON.stringify(answers),
          score,
          analysis: JSON.stringify({
            interpretation: analysis,
            recommendations
          })
        }
      });

      // Check for crisis situations
      if (quizType === 'phq9' && this.checkForSuicidalIdeation(answers)) {
        // Trigger crisis protocol
        await this.triggerCrisisProtocol(userId);
      }

      return {
        id: quiz.id,
        type: quiz.type,
        score: quiz.score || 0,
        analysis,
        recommendations,
        createdAt: quiz.createdAt
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  async getQuizHistory(userId: string, quizType?: string, limit: number = 10): Promise<QuizResult[]> {
    try {
      const quizzes = await this.prisma.quiz.findMany({
        where: {
          userId,
          ...(quizType && { type: quizType })
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return quizzes.map(quiz => {
        const analysisData = quiz.analysis ? JSON.parse(quiz.analysis) : { interpretation: '', recommendations: [] };
        
        return {
          id: quiz.id,
          type: quiz.type,
          score: quiz.score || 0,
          analysis: analysisData.interpretation || '',
          recommendations: analysisData.recommendations || [],
          createdAt: quiz.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting quiz history:', error);
      throw error;
    }
  }

  async getQuizTrends(userId: string, quizType: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const quizzes = await this.prisma.quiz.findMany({
        where: {
          userId,
          type: quizType,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const trend = quizzes.map(quiz => ({
        date: quiz.createdAt.toISOString().split('T')[0],
        score: quiz.score || 0
      }));

      const averageScore = quizzes.length > 0 
        ? quizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / quizzes.length 
        : 0;

      const improvement = quizzes.length >= 2 
        ? (quizzes[quizzes.length - 1].score || 0) - (quizzes[0].score || 0)
        : 0;

      return {
        trend,
        averageScore,
        improvement,
        totalQuizzes: quizzes.length
      };
    } catch (error) {
      console.error('Error getting quiz trends:', error);
      throw error;
    }
  }

  private calculatePHQ9Score(answers: QuizAnswer[]): number {
    return answers.reduce((sum, answer) => {
      if (typeof answer.answer === 'string') {
        const options = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
        return sum + options.indexOf(answer.answer as string);
      }
      return sum + (answer.answer as number);
    }, 0);
  }

  private calculateGAD7Score(answers: QuizAnswer[]): number {
    return answers.reduce((sum, answer) => {
      if (typeof answer.answer === 'string') {
        const options = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
        return sum + options.indexOf(answer.answer as string);
      }
      return sum + (answer.answer as number);
    }, 0);
  }

  private calculateDailyCheckInScore(answers: QuizAnswer[]): number {
    const ratingAnswers = answers.filter(a => 
      ['daily_mood', 'daily_energy', 'daily_sleep'].includes(a.questionId)
    );
    
    const stressAnswer = answers.find(a => a.questionId === 'daily_stress');
    
    let score = ratingAnswers.reduce((sum, answer) => {
      if (typeof answer.answer === 'string') {
        const positiveOptions = ['Very poor', 'Poor', 'Fair', 'Good', 'Very good'];
        return sum + positiveOptions.indexOf(answer.answer as string);
      }
      return sum + (answer.answer as number);
    }, 0);

    // Reverse stress score (lower stress = higher overall score)
    if (stressAnswer) {
      if (typeof stressAnswer.answer === 'string') {
        const stressOptions = ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'];
        score += (4 - stressOptions.indexOf(stressAnswer.answer as string));
      } else {
        score += (4 - (stressAnswer.answer as number));
      }
    }

    return score;
  }

  private analyzePHQ9Score(score: number): string {
    if (score <= 4) return 'Minimal depression symptoms';
    if (score <= 9) return 'Mild depression symptoms';
    if (score <= 14) return 'Moderate depression symptoms';
    if (score <= 19) return 'Moderately severe depression symptoms';
    return 'Severe depression symptoms';
  }

  private analyzeGAD7Score(score: number): string {
    if (score <= 4) return 'Minimal anxiety symptoms';
    if (score <= 9) return 'Mild anxiety symptoms';
    if (score <= 14) return 'Moderate anxiety symptoms';
    return 'Severe anxiety symptoms';
  }

  private analyzeDailyCheckIn(answers: QuizAnswer[]): string {
    const score = this.calculateDailyCheckInScore(answers);
    if (score >= 14) return 'You\'re having a great day!';
    if (score >= 10) return 'You\'re doing well today';
    if (score >= 6) return 'You\'re having an okay day';
    return 'You might be struggling today';
  }

  private getPHQ9Recommendations(score: number, answers: QuizAnswer[]): string[] {
    const recommendations = [];

    if (score <= 4) {
      recommendations.push('Continue maintaining good mental health habits');
      recommendations.push('Stay connected with friends and family');
    } else if (score <= 9) {
      recommendations.push('Consider lifestyle changes like regular exercise');
      recommendations.push('Practice stress reduction techniques');
      recommendations.push('Maintain regular sleep schedule');
    } else if (score <= 14) {
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Reach out to trusted friends or family');
      recommendations.push('Practice mindfulness and relaxation techniques');
    } else {
      recommendations.push('Strongly consider professional mental health support');
      recommendations.push('Contact your doctor or a mental health professional');
      recommendations.push('Reach out to your support network');
    }

    // Check for specific symptoms
    const sleepIssue = answers.find(a => a.questionId === 'phq9_3' && 
      ['More than half the days', 'Nearly every day'].includes(a.answer as string));
    if (sleepIssue) {
      recommendations.push('Focus on improving sleep hygiene');
    }

    const energyIssue = answers.find(a => a.questionId === 'phq9_4' && 
      ['More than half the days', 'Nearly every day'].includes(a.answer as string));
    if (energyIssue) {
      recommendations.push('Consider gentle exercise to boost energy');
    }

    return recommendations;
  }

  private getGAD7Recommendations(score: number): string[] {
    const recommendations = [];

    if (score <= 4) {
      recommendations.push('Continue practicing stress management');
      recommendations.push('Maintain healthy lifestyle habits');
    } else if (score <= 9) {
      recommendations.push('Try relaxation techniques like deep breathing');
      recommendations.push('Consider regular physical activity');
      recommendations.push('Limit caffeine intake');
    } else if (score <= 14) {
      recommendations.push('Consider speaking with a counselor about anxiety management');
      recommendations.push('Practice mindfulness meditation');
      recommendations.push('Try progressive muscle relaxation');
    } else {
      recommendations.push('Consider professional treatment for anxiety');
      recommendations.push('Speak with a healthcare provider');
      recommendations.push('Consider cognitive-behavioral therapy techniques');
    }

    return recommendations;
  }

  private getDailyCheckInRecommendations(answers: QuizAnswer[]): string[] {
    const recommendations = [];

    const moodAnswer = answers.find(a => a.questionId === 'daily_mood');
    const energyAnswer = answers.find(a => a.questionId === 'daily_energy');
    const sleepAnswer = answers.find(a => a.questionId === 'daily_sleep');
    const stressAnswer = answers.find(a => a.questionId === 'daily_stress');

    if (moodAnswer && ['Very poor', 'Poor'].includes(moodAnswer.answer as string)) {
      recommendations.push('Try listening to mood-boosting music');
      recommendations.push('Consider reaching out to a friend');
    }

    if (energyAnswer && ['Very low', 'Low'].includes(energyAnswer.answer as string)) {
      recommendations.push('Take a short walk or do light exercise');
      recommendations.push('Ensure you\'re staying hydrated');
    }

    if (sleepAnswer && ['Very poorly', 'Poorly'].includes(sleepAnswer.answer as string)) {
      recommendations.push('Focus on better sleep hygiene tonight');
      recommendations.push('Avoid screens before bedtime');
    }

    if (stressAnswer && ['Very', 'Extremely'].includes(stressAnswer.answer as string)) {
      recommendations.push('Try a 5-minute breathing exercise');
      recommendations.push('Consider what\'s causing stress and if you can address it');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up the great work on your mental health!');
    }

    return recommendations;
  }

  private checkForSuicidalIdeation(answers: QuizAnswer[]): boolean {
    const suicidalQuestion = answers.find(a => a.questionId === 'phq9_9');
    return suicidalQuestion && 
           ['More than half the days', 'Nearly every day'].includes(suicidalQuestion.answer as string);
  }

  private async triggerCrisisProtocol(userId: string): Promise<void> {
    console.log(`Crisis protocol triggered for user ${userId}`);
    // This would integrate with the SOS service or send immediate alerts
    // Implementation would depend on your crisis intervention procedures
  }
}