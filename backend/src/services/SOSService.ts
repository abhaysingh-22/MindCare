import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

export interface TrustedContactData {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface EmergencyAlertData {
  location?: string;
  message?: string;
}

export class SOSService {
  private prisma: PrismaClient;
  private twilioClient: any;

  constructor() {
    this.prisma = new PrismaClient();
    
    // Initialize Twilio if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async addTrustedContact(userId: string, contactData: TrustedContactData): Promise<any> {
    try {
      // If this is set as primary, remove primary status from others
      if (contactData.isPrimary) {
        await this.prisma.trustedContact.updateMany({
          where: {
            userId,
            isPrimary: true
          },
          data: {
            isPrimary: false
          }
        });
      }

      const contact = await this.prisma.trustedContact.create({
        data: {
          userId,
          ...contactData
        }
      });

      return contact;
    } catch (error) {
      console.error('Error adding trusted contact:', error);
      throw error;
    }
  }

  async getTrustedContacts(userId: string): Promise<any[]> {
    try {
      const contacts = await this.prisma.trustedContact.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      return contacts;
    } catch (error) {
      console.error('Error getting trusted contacts:', error);
      throw error;
    }
  }

  async updateTrustedContact(contactId: string, userId: string, updateData: Partial<TrustedContactData>): Promise<any> {
    try {
      // If this is set as primary, remove primary status from others
      if (updateData.isPrimary) {
        await this.prisma.trustedContact.updateMany({
          where: {
            userId,
            isPrimary: true,
            id: { not: contactId }
          },
          data: {
            isPrimary: false
          }
        });
      }

      const contact = await this.prisma.trustedContact.update({
        where: {
          id: contactId,
          userId // Ensure user owns this contact
        },
        data: updateData
      });

      return contact;
    } catch (error) {
      console.error('Error updating trusted contact:', error);
      throw error;
    }
  }

  async deleteTrustedContact(contactId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.trustedContact.update({
        where: {
          id: contactId,
          userId // Ensure user owns this contact
        },
        data: {
          isActive: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting trusted contact:', error);
      throw error;
    }
  }

  async triggerSOS(userId: string, alertData: EmergencyAlertData): Promise<any> {
    try {
      // Create emergency alert record
      const alert = await this.prisma.emergencyAlert.create({
        data: {
          userId,
          location: alertData.location,
          message: alertData.message || 'Emergency assistance needed',
          status: 'active'
        }
      });

      // Get user information
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          emergencyContact: true
        }
      });

      // Get trusted contacts
      const trustedContacts = await this.prisma.trustedContact.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { isPrimary: 'desc' }
      });

      const notifications = [];

      // Prepare emergency message
      const emergencyMessage = this.createEmergencyMessage(user, alertData);

      // Send notifications to trusted contacts
      for (const contact of trustedContacts) {
        try {
          // Send SMS if Twilio is configured
          if (this.twilioClient && contact.phone) {
            const smsResult = await this.sendSMS(contact.phone, emergencyMessage);
            notifications.push({
              type: 'sms',
              recipient: contact.phone,
              status: smsResult ? 'sent' : 'failed'
            });
          }

          // Send email if configured (you would need to implement email service)
          if (contact.email) {
            // Email implementation would go here
            notifications.push({
              type: 'email',
              recipient: contact.email,
              status: 'pending'
            });
          }
        } catch (error) {
          console.error(`Error notifying contact ${contact.name}:`, error);
          notifications.push({
            type: 'error',
            recipient: contact.name,
            status: 'failed'
          });
        }
      }

      // If no trusted contacts, try emergency contact from user profile
      if (trustedContacts.length === 0 && user?.emergencyContact) {
        try {
          if (this.twilioClient) {
            const smsResult = await this.sendSMS(user.emergencyContact, emergencyMessage);
            notifications.push({
              type: 'sms',
              recipient: user.emergencyContact,
              status: smsResult ? 'sent' : 'failed'
            });
          }
        } catch (error) {
          console.error('Error notifying emergency contact:', error);
        }
      }

      return {
        alert,
        notifications,
        message: 'Emergency alert sent to trusted contacts'
      };
    } catch (error) {
      console.error('Error triggering SOS:', error);
      throw error;
    }
  }

  async getEmergencyAlerts(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const alerts = await this.prisma.emergencyAlert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return alerts;
    } catch (error) {
      console.error('Error getting emergency alerts:', error);
      throw error;
    }
  }

  async resolveEmergencyAlert(alertId: string, userId: string): Promise<any> {
    try {
      const alert = await this.prisma.emergencyAlert.update({
        where: {
          id: alertId,
          userId // Ensure user owns this alert
        },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });

      return alert;
    } catch (error) {
      console.error('Error resolving emergency alert:', error);
      throw error;
    }
  }

  async cancelEmergencyAlert(alertId: string, userId: string): Promise<any> {
    try {
      const alert = await this.prisma.emergencyAlert.update({
        where: {
          id: alertId,
          userId // Ensure user owns this alert
        },
        data: {
          status: 'cancelled',
          resolvedAt: new Date()
        }
      });

      // Notify trusted contacts about cancellation
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });

      const trustedContacts = await this.prisma.trustedContact.findMany({
        where: { userId, isActive: true }
      });

      const cancelMessage = `UPDATE: ${user?.firstName} ${user?.lastName} has cancelled their emergency alert. They are now safe.`;

      for (const contact of trustedContacts) {
        if (this.twilioClient && contact.phone) {
          await this.sendSMS(contact.phone, cancelMessage);
        }
      }

      return alert;
    } catch (error) {
      console.error('Error cancelling emergency alert:', error);
      throw error;
    }
  }

  private createEmergencyMessage(user: any, alertData: EmergencyAlertData): string {
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Someone';
    const location = alertData.location ? ` at ${alertData.location}` : '';
    const customMessage = alertData.message ? `\n\nMessage: ${alertData.message}` : '';
    
    return `🚨 EMERGENCY ALERT 🚨\n\n${userName} needs immediate assistance${location}.${customMessage}\n\nThis is an automated message from MindCare app. Please check on them immediately or contact emergency services if needed.\n\nTime: ${new Date().toLocaleString()}`;
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        console.log('Twilio not configured. Would send SMS:', { phoneNumber, message });
        return false;
      }

      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Emergency resources and helplines
  async getEmergencyResources(country: string = 'US'): Promise<any[]> {
    const resources: { [key: string]: any[] } = {
      US: [
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          website: 'https://suicidepreventionlifeline.org',
          description: '24/7 crisis support'
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          website: 'https://crisistextline.org',
          description: '24/7 text support'
        },
        {
          name: 'Emergency Services',
          phone: '911',
          description: 'Police, Fire, Medical Emergency'
        },
        {
          name: 'SAMHSA National Helpline',
          phone: '1-800-662-4357',
          website: 'https://samhsa.gov',
          description: 'Mental health and substance abuse treatment'
        }
      ]
    };

    return resources[country] || resources.US;
  }
}