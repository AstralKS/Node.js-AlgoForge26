import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/patient.controller';

const router = Router();

// Login (no auth — just email + role)
router.post('/login', validate(ctrl.loginSchema), ctrl.login);

// Register
router.post('/register/patient', validate(ctrl.registerPatientSchema), ctrl.registerPatient);
router.post('/register/doctor', validate(ctrl.registerDoctorSchema), ctrl.registerDoctor);

// List users (testing)
router.get('/users', ctrl.getAllUsers);

export default router;
