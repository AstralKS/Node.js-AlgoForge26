import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/transcription.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Audio Transcription & Processing
router.post('/upload', upload.single('audio'), ctrl.uploadAndTranscribe);

export default router;
