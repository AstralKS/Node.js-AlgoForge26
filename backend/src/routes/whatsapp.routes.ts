import { Router } from 'express';
import * as ctrl from '../controllers/whatsapp.controller';

const router = Router();

// Twilio webhook (POST from Twilio when WhatsApp message arrives)
router.post('/webhook', ctrl.handleIncoming);

// Test endpoint — simulate WhatsApp message processing
router.post('/simulate', ctrl.simulateMessage);

// Send WhatsApp message (for testing)
router.post('/send', ctrl.sendMessage);

export default router;
