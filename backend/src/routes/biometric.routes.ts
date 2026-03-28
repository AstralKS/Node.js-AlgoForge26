import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/biometric.controller';

const router = Router();

router.post('/', validate(ctrl.createBiometricSchema), ctrl.createBiometric);
router.get('/patient/:patientId', ctrl.getBiometricsByPatient);
router.get('/patient/:patientId/recent', ctrl.getRecentBiometrics);
router.delete('/:id', ctrl.deleteBiometric);

export default router;
