import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/medication.controller';

const router = Router();

router.post('/', validate(ctrl.createMedicationSchema), ctrl.createMedication);
router.get('/patient/:patientId', ctrl.getMedicationsByPatient);
router.get('/patient/:patientId/active', ctrl.getActiveMedications);
router.get('/patient/:patientId/adherence', ctrl.getAdherenceRate);
router.delete('/:id', ctrl.deleteMedication);

// Medication logs
router.post('/log', validate(ctrl.logMedicationSchema), ctrl.logMedication);
router.get('/log/patient/:patientId', ctrl.getMedicationLogs);

export default router;
