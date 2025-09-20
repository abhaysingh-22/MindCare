import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  emergencyContact?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private prisma: PrismaClient;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  async register(userData: RegisterData): Promise<{ user: AuthUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Initialize user streaks
      await this.initializeUserStreaks(user.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as AuthUser,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(loginData: LoginData): Promise<{ user: AuthUser; token: string }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as AuthUser,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user as AuthUser;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          phoneNumber: true,
          emergencyContact: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      });

      return user as AuthUser;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: Partial<RegisterData>): Promise<AuthUser> {
    try {
      // Remove password from update data if present
      const { password, ...safeUpdateData } = updateData as any;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: safeUpdateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          phoneNumber: true,
          emergencyContact: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      });

      return updatedUser as AuthUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async deactivateAccount(userId: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      return true;
    } catch (error) {
      console.error('Deactivate account error:', error);
      throw error;
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  private async initializeUserStreaks(userId: string): Promise<void> {
    const streakTypes = ['mood_logging', 'meditation', 'exercise', 'sleep'];
    
    for (const type of streakTypes) {
      await this.prisma.streak.create({
        data: {
          userId,
          type,
          count: 0,
          maxCount: 0,
          isActive: true
        }
      });
    }
  }
}