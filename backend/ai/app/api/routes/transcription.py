import tempfile
import os
from fastapi import APIRouter, File, UploadFile, HTTPException

from app.modules.transcription.file_transcriber import FileTranscriber
from app.modules.transcription.soap import build_soap_note
from app.modules.transcription.diarizer import label_roles

router = APIRouter()
transcriber = FileTranscriber()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    1. Uploads temporary .wav recording to AssemblyAI
    2. Retrieves transcript with Speaker Diarization
    3. Feeds utterances into Medical BERT to create SOAP clinical note.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await file.read())
            temp_path = tmp.name

        assembly_data = transcriber.transcribe(temp_path)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

        raw_text = assembly_data.get("text", "")
        utterances = assembly_data.get("utterances", [])

        if not utterances:
            speaker_segments = [{"text": raw_text, "speaker": "UNKNOWN", "start": 0, "end": 0}]
        else:
            speaker_segments = utterances

        # Determine who was Doctor / Patient based on our ML heuristic in label_roles
        roles = label_roles(speaker_segments)
        
        # Build the BERT-powered Structured SOAP Note
        ai_patient_report = build_soap_note(speaker_segments, roles)

        # Here you would typically save `ai_patient_report` directly to Supabase
        # for the patient to view it online later!

        return {
            "status": "success",
            "whisper_raw_transcription": raw_text,
            "patient_friendly_report": ai_patient_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
