import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { checkAIServiceHealth } from './services/aiServiceProxy';

// Routes
import patientRoutes from './routes/patient.routes';
import symptomRoutes from './routes/symptom.routes';
import medicationRoutes from './routes/medication.routes';
import biometricRoutes from './routes/biometric.routes';
import visitRoutes from './routes/visit.routes';
import aiRoutes from './routes/ai.routes';
import whatsappRoutes from './routes/whatsapp.routes';

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.path}`);
  next();
});

// ── Static files (temp UI) ───────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'temp-ui')));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth', patientRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
// Shortcut: Twilio can also hit /webhook directly
app.use('/', whatsappRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  let aiServiceUp = false;
  try {
    aiServiceUp = await checkAIServiceHealth();
  } catch { /* ignore */ }

  res.json({
    status: 'ok',
    service: 'mediai-backend',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    ai_service: {
      url: env.AI_SERVICE_URL,
      status: aiServiceUp ? 'connected' : 'disconnected',
      note: aiServiceUp
        ? 'Python AI Service is online — using full pipeline'
        : 'Python AI Service offline — using direct OpenRouter fallback',
    },
  });
});

// ── AI Service connectivity check ────────────────────────
app.get('/api/ai/service-status', async (_req, res) => {
  try {
    const isUp = await checkAIServiceHealth();
    res.json({
      success: true,
      ai_service: {
        url: env.AI_SERVICE_URL,
        status: isUp ? 'connected' : 'disconnected',
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      ai_service: {
        url: env.AI_SERVICE_URL,
        status: 'error',
        error: err.message,
      },
    });
  }
});

// ── Sample data endpoint (for seeding) ────────────────────
app.get('/api/sample-data', (_req, res) => {
  const { SAMPLE_PATIENTS, SAMPLE_DOCTORS, SAMPLE_SYMPTOMS, SAMPLE_BIOMETRICS, SAMPLE_WHATSAPP_MESSAGES } = require('./utils/sampleData');
  res.json({ patients: SAMPLE_PATIENTS, doctors: SAMPLE_DOCTORS, symptoms: SAMPLE_SYMPTOMS, biometrics: SAMPLE_BIOMETRICS, whatsappMessages: SAMPLE_WHATSAPP_MESSAGES });
});

// ── Seed endpoint (creates sample data in Supabase) ──────
app.post('/api/seed', async (_req, res, next) => {
  try {
    const { SAMPLE_PATIENTS, SAMPLE_DOCTORS } = require('./utils/sampleData');
    const UserModel = require('./models/User');
    const PatientModel = require('./models/Patient');
    const DoctorModel = require('./models/Doctor');

    const results: any = { doctors: [], patients: [] };

    // Create doctors
    for (const doc of SAMPLE_DOCTORS) {
      try {
        const user = await UserModel.createUser({ name: doc.name, email: doc.email, phone: doc.phone, role: 'doctor' });
        const doctor = await DoctorModel.createDoctor({ user_id: user.id, specialization: doc.specialization, license_number: doc.license_number, hospital: doc.hospital });
        results.doctors.push({ user, doctor });
      } catch (err: any) {
        results.doctors.push({ error: err.message, email: doc.email });
      }
    }

    // Create patients (assign to first doctor)
    const firstDoctorId = results.doctors[0]?.doctor?.id || null;
    for (const pat of SAMPLE_PATIENTS) {
      try {
        const user = await UserModel.createUser({ name: pat.name, email: pat.email, phone: pat.phone, role: 'patient' });
        const patient = await PatientModel.createPatient({
          user_id: user.id,
          date_of_birth: pat.date_of_birth, gender: pat.gender, blood_group: pat.blood_group,
          medical_history: pat.medical_history, current_diagnosis: pat.current_diagnosis,
          whatsapp_number: pat.whatsapp_number, assigned_doctor_id: firstDoctorId,
        });
        results.patients.push({ user, patient });
      } catch (err: any) {
        results.patients.push({ error: err.message, email: pat.email });
      }
    }

    res.json({ success: true, seeded: results });
  } catch (err) {
    next(err);
  }
});

// ── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────
const PORT = parseInt(env.PORT);

app.listen(PORT, async () => {
  // Check AI Service connectivity on startup
  let aiStatus = '❌ disconnected (will use direct OpenRouter fallback)';
  try {
    const isUp = await checkAIServiceHealth();
    if (isUp) {
      aiStatus = `✅ connected at ${env.AI_SERVICE_URL}`;
    }
  } catch { /* ignore */ }

  logger.info(`
╔══════════════════════════════════════════════════╗
║            🏥 MediAI Backend v1.1               ║
║──────────────────────────────────────────────────║
║  Server:      http://localhost:${PORT}               ║
║  Temp UI:     http://localhost:${PORT}               ║
║  Health:      http://localhost:${PORT}/api/health     ║
║  AI Service:  ${aiStatus.substring(0, 36).padEnd(36)}║
║  Env:         ${env.NODE_ENV.padEnd(36)}║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
