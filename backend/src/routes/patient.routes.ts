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

// Quick Add Patient from Doctor Dashboard
router.post('/quick-add', validate(ctrl.quickAddPatientSchema), ctrl.quickAddPatient);

// Get all patients with user details
router.get('/patients', ctrl.getAllPatientsData);

// Get Full Patient Profile
router.get('/patient/:id/full-profile', ctrl.getFullPatientProfile);

export default router;
