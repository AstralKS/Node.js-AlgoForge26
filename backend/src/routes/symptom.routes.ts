import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/symptom.controller';

const router = Router();

router.post('/', validate(ctrl.createSymptomSchema), ctrl.createSymptom);
router.get('/patient/:patientId', ctrl.getSymptomsByPatient);
router.get('/patient/:patientId/recent', ctrl.getRecentSymptoms);
router.get('/:id', ctrl.getSymptomById);
router.delete('/:id', ctrl.deleteSymptom);

export default router;
