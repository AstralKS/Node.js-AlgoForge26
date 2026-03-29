import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { generateSOAPNote } from '../services/aiService';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';

/**
 * Upload audio and transcribe using AssemblyAI
 */
export async function uploadAndTranscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return sendError(res, 'No audio file provided', 400);
    }

    if (!patientId) {
      return sendError(res, 'Patient ID is required', 400);
    }

    const assemblyApiKey = process.env.ASSEMBLY_API_KEY;
    if (!assemblyApiKey) {
      logger.error('ASSEMBLY_API_KEY not found');
      return sendError(res, 'Transcription service misconfigured', 500);
    }

    logger.info(`🎙️ Received audio for patient ${patientId}, size: ${audioFile.size} bytes`);

    // 1. Upload to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': assemblyApiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: audioFile.buffer,
    });

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text();
      logger.error(`AssemblyAI upload error: ${err}`);
      return sendError(res, 'Failed to upload audio to transcription service', 500);
    }

    const { upload_url } = await uploadResponse.json() as any;

    // 2. Start Transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speaker_labels: true,
      }),
    });

    const { id: transcriptId } = await transcriptResponse.json() as any;

    // 3. Poll for completion (simplified for this task)
    let transcriptData: any;
    let attempts = 0;
    while (attempts < 30) {
      const checkResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'Authorization': assemblyApiKey },
      });
      transcriptData = await checkResponse.json();
      
      if (transcriptData.status === 'completed') break;
      if (transcriptData.status === 'error') throw new Error(`Transcription failed: ${transcriptData.error}`);
      
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }

    if (transcriptData.status !== 'completed') {
      return sendError(res, 'Transcription timed out', 504);
    }

    const raw_text = transcriptData.text;
    logger.info(`✅ Transcription complete for patient ${patientId}`);

    // 4. Generate SOAP Note using Gemini
    logger.info(`🧠 Generating SOAP note for transcript...`);
    const soap_json = await generateSOAPNote(raw_text);

    // 5. Save to database
    const { data: transcription, error } = await supabaseAdmin
      .from('transcriptions')
      .insert({
        patient_id: patientId,
        raw_text,
        soap_json,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    sendSuccess(res, { transcription, message: 'Consultation recorded and processed' });
  } catch (err) {
    next(err);
  }
}
