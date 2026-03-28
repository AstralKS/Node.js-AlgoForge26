import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/message.controller';

const router = Router();

// AI Coordinator Chat (logs to messages table)
router.post('/ai-chat', validate(ctrl.aiChatSchema), ctrl.aiChat);

// Direct messages (patient ↔ doctor)
router.post('/', validate(ctrl.sendMessageSchema), ctrl.sendMessage);
router.get('/conversation', ctrl.getConversation);

// AI Chat history for patient
router.get('/ai-history/:patientUserId', ctrl.getAIChatHistory);

// Unread count
router.get('/unread/:userId', ctrl.getUnreadCount);

export default router;
