import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/ai.controller';

const router = Router();

// AI Analysis
router.post('/analyze', validate(ctrl.analyzeSchema), ctrl.analyzeSymptoms);
router.post('/format-whatsapp', validate(ctrl.formatWhatsAppSchema), ctrl.formatWhatsApp);
router.post('/weekly-report', validate(ctrl.weeklyReportSchema), ctrl.generateWeeklyReport);
router.post('/risk-eval', validate(ctrl.riskEvalSchema), ctrl.evaluateRisk);

// Reports
router.get('/reports/patient/:patientId', ctrl.getReports);
router.get('/reports/unsigned', ctrl.getUnsignedReports);
router.post('/reports/:id/sign', ctrl.signReport);

// Alerts
router.get('/alerts', ctrl.getAlerts);
router.post('/alerts/:id/read', ctrl.markAlertRead);

export default router;
