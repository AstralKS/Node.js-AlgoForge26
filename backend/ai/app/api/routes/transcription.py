import tempfile
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

from app.modules.transcription.file_transcriber import FileTranscriber
from app.modules.transcription.soap import build_soap_note, build_soap_dict
from app.modules.transcription.diarizer import label_roles

# Supabase client (optional — gracefully disabled if not configured)
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[Supabase] Could not init client: {e}")

router = APIRouter()
transcriber = FileTranscriber()


def _try_convert_to_wav(input_path: str) -> str | None:
    """
    Attempt to convert audio to 16kHz WAV using ffmpeg (if available).
    Returns the new path on success, None if ffmpeg is not installed.
    """
    import subprocess
    wav_path = input_path + "_converted.wav"
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-f", "wav", wav_path],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode == 0:
            return wav_path
        print(f"[ffmpeg] Conversion failed: {result.stderr[:200]}")
        return None
    except FileNotFoundError:
        print("[ffmpeg] Not installed — sending raw audio directly to AssemblyAI (it supports webm/ogg)")
        return None


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    patient_id: str | None = None
):
    """
    1. Accepts any audio upload from the browser (webm, wav, ogg…)
    2. Tries to convert to WAV via ffmpeg; falls back to raw upload
    3. Sends to AssemblyAI for transcription + speaker diarization
    4. Runs BERT Medical NER to generate a structured SOAP note
    5. Saves transcript + SOAP note to Supabase transcriptions table
    """
    raw_path = None
    wav_path = None

    try:
        # Determine file suffix from upload filename
        orig_name = file.filename or "recording.webm"
        suffix = os.path.splitext(orig_name)[-1] or ".webm"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            raw_path = tmp.name

        # Try to convert; if ffmpeg is unavailable, use the raw file
        wav_path = _try_convert_to_wav(raw_path)
        transcribe_path = wav_path if wav_path else raw_path

        # Transcribe via AssemblyAI
        assembly_data = transcriber.transcribe(transcribe_path)

        raw_text = assembly_data.get("text", "")
        utterances = assembly_data.get("utterances", [])

        speaker_segments = utterances if utterances else [
            {"text": raw_text, "speaker": "UNKNOWN", "start": 0, "end": 0}
        ]

        # Identify Doctor vs Patient speakers using ML heuristic
        roles = label_roles(speaker_segments)

        # Build both display-text and structured-dict SOAP note
        soap_text = build_soap_note(speaker_segments, roles)
        soap_dict = build_soap_dict(speaker_segments, roles)

        # Persist to Supabase
        saved_id = None
        if supabase and raw_text:
            try:
                row = {
                    "raw_transcript": raw_text,
                    "soap_note": soap_text,
                    "soap_json": soap_dict,
                    "source": "web",
                }
                if patient_id:
                    row["patient_id"] = patient_id
                resp = supabase.table("transcriptions").insert(row).execute()
                if resp.data:
                    saved_id = resp.data[0].get("id")
                    print(f"[Supabase] Transcription saved → {saved_id}")
            except Exception as db_err:
                print(f"[Supabase] Save failed (non-fatal): {db_err}")

        return {
            "status": "success",
            "whisper_raw_transcription": raw_text,
            "patient_friendly_report": soap_dict,
            "soap_text": soap_text,
            "transcription_id": saved_id,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        for path in set(filter(None, [raw_path, wav_path])):
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
