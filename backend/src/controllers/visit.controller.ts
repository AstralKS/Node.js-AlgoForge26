import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as VisitModel from '../models/Visit';
import { sendSuccess, sendCreated } from '../utils/response';

// ── Schemas ──────────────────────────────────────────────
export const createVisitSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid().nullable().optional(),
  date: z.string(),
  notes: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  prescriptions: z.any().nullable().optional(),
  follow_up_date: z.string().nullable().optional(),
});

// ── Controllers ──────────────────────────────────────────

export async function createVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const visit = await VisitModel.createVisit({
      ...req.body,
      doctor_id: req.body.doctor_id || null,
      notes: req.body.notes || null,
      transcript: req.body.transcript || null,
      prescriptions: req.body.prescriptions || null,
      follow_up_date: req.body.follow_up_date || null,
    });
    sendCreated(res, visit);
  } catch (err) { next(err); }
}

export async function getVisitsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const visits = await VisitModel.getVisitsByPatient(req.params.patientId);
    sendSuccess(res, visits);
  } catch (err) { next(err); }
}

export async function getVisitsByDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const visits = await VisitModel.getVisitsByDoctor(req.params.doctorId);
    sendSuccess(res, visits);
  } catch (err) { next(err); }
}

export async function getUpcomingVisits(req: Request, res: Response, next: NextFunction) {
  try {
    const visits = await VisitModel.getUpcomingVisits(req.params.patientId);
    sendSuccess(res, visits);
  } catch (err) { next(err); }
}

export async function getVisitById(req: Request, res: Response, next: NextFunction) {
  try {
    const visit = await VisitModel.getVisitById(req.params.id);
    sendSuccess(res, visit);
  } catch (err) { next(err); }
}

export async function updateVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const visit = await VisitModel.updateVisit(req.params.id, req.body);
    sendSuccess(res, visit);
  } catch (err) { next(err); }
}

export async function deleteVisit(req: Request, res: Response, next: NextFunction) {
  try {
    await VisitModel.deleteVisit(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
