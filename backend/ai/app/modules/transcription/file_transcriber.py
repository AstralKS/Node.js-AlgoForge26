import os
import time
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
ASSEMBLY_API_KEY = os.getenv("ASSEMBLY_API_KEY", "")

class FileTranscriber:
    """
    Uploads an audio file to AssemblyAI via their REST API.
    Returns the transcription with speaker diarization.
    """
    def __init__(self):
        if not ASSEMBLY_API_KEY:
            raise ValueError("ASSEMBLY_API_KEY is missing from .env")
        self.headers = {"authorization": ASSEMBLY_API_KEY}

    def transcribe(self, file_path: str) -> dict:
        print(f"[AssemblyAI] Uploading {file_path}...")
        
        # 1. Upload audio file to AssemblyAI
        with open(file_path, 'rb') as f:
            up_res = requests.post(
                "https://api.assemblyai.com/v2/upload",
                headers=self.headers,
                data=f
            )
        up_res.raise_for_status()
        upload_url = up_res.json()["upload_url"]

        print("[AssemblyAI] Upload complete. Starting transcription...")
        
        # 2. Start transcription job with speaker diarization enabled natively
        json_data = {
            "audio_url": upload_url,
            "speaker_labels": True,
            "language_detection": True  # auto detect Hindi/English/etc
        }
        tx_res = requests.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=self.headers,
            json=json_data
        )
        tx_res.raise_for_status()
        transcript_id = tx_res.json()["id"]

        print(f"[AssemblyAI] Processing ({transcript_id})...")
        
        # 3. Poll for completion
        while True:
            res = requests.get(
                f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                headers=self.headers
            )
            res.raise_for_status()
            data = res.json()
            
            if data["status"] == "completed":
                print("[AssemblyAI] Transcription finished.")
                return data
            elif data["status"] == "error":
                raise Exception(f"AssemblyAI Error: {data['error']}")
                
            time.sleep(3)
