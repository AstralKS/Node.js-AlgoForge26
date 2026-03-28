import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as ctrl from '../controllers/visit.controller';

const router = Router();

router.post('/', validate(ctrl.createVisitSchema), ctrl.createVisit);
router.get('/patient/:patientId', ctrl.getVisitsByPatient);
router.get('/patient/:patientId/upcoming', ctrl.getUpcomingVisits);
router.get('/doctor/:doctorId', ctrl.getVisitsByDoctor);
router.get('/:id', ctrl.getVisitById);
router.patch('/:id', ctrl.updateVisit);
router.delete('/:id', ctrl.deleteVisit);

export default router;
