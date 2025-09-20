import express from 'express';
import { SOSService } from '../services/SOSService';
import { AuthService } from '../services/AuthService';

const router = express.Router();
const sosService = new SOSService();
const authService = new AuthService();

// Middleware to authenticate requests
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Add trusted contact
router.post('/contacts', authenticate, async (req: any, res) => {
  try {
    const contact = await sosService.addTrustedContact(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Trusted contact added successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add trusted contact'
    });
  }
});

// Get trusted contacts
router.get('/contacts', authenticate, async (req: any, res) => {
  try {
    const contacts = await sosService.getTrustedContacts(req.user.id);
    res.json({
      success: true,
      data: contacts,
      message: 'Trusted contacts retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trusted contacts'
    });
  }
});

// Update trusted contact
router.put('/contacts/:contactId', authenticate, async (req: any, res) => {
  try {
    const contact = await sosService.updateTrustedContact(
      req.params.contactId,
      req.user.id,
      req.body
    );
    res.json({
      success: true,
      data: contact,
      message: 'Trusted contact updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update trusted contact'
    });
  }
});

// Delete trusted contact
router.delete('/contacts/:contactId', authenticate, async (req: any, res) => {
  try {
    await sosService.deleteTrustedContact(req.params.contactId, req.user.id);
    res.json({
      success: true,
      message: 'Trusted contact deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete trusted contact'
    });
  }
});

// Trigger SOS
router.post('/alert', authenticate, async (req: any, res) => {
  try {
    const alert = await sosService.triggerSOS(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: alert,
      message: 'Emergency alert sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send emergency alert'
    });
  }
});

// Get emergency alerts
router.get('/alerts', authenticate, async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const alerts = await sosService.getEmergencyAlerts(req.user.id, limit);
    res.json({
      success: true,
      data: alerts,
      message: 'Emergency alerts retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get emergency alerts'
    });
  }
});

// Resolve emergency alert
router.put('/alerts/:alertId/resolve', authenticate, async (req: any, res) => {
  try {
    const alert = await sosService.resolveEmergencyAlert(req.params.alertId, req.user.id);
    res.json({
      success: true,
      data: alert,
      message: 'Emergency alert resolved successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resolve emergency alert'
    });
  }
});

// Cancel emergency alert
router.put('/alerts/:alertId/cancel', authenticate, async (req: any, res) => {
  try {
    const alert = await sosService.cancelEmergencyAlert(req.params.alertId, req.user.id);
    res.json({
      success: true,
      data: alert,
      message: 'Emergency alert cancelled successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel emergency alert'
    });
  }
});

// Get emergency resources
router.get('/resources', async (req, res) => {
  try {
    const country = req.query.country as string || 'US';
    const resources = await sosService.getEmergencyResources(country);
    res.json({
      success: true,
      data: resources,
      message: 'Emergency resources retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get emergency resources'
    });
  }
});

export default router;