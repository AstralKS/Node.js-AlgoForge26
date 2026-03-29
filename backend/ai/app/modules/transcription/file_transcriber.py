"""
file_transcriber.py — Audio transcription via AssemblyAI REST API v2
Uses raw HTTP requests to have full control over the API parameters.
"""
import os
import time
import requests
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

ASSEMBLY_API_KEY = os.getenv("ASSEMBLY_API_KEY", "")
BASE_URL = "https://api.assemblyai.com"


class FileTranscriber:
    """
    Transcribes audio via AssemblyAI v2 REST API with correct parameters.
    Returns {text, utterances: [{speaker, text, start, end}, ...]}
    """

    def __init__(self):
        if not ASSEMBLY_API_KEY:
            raise ValueError("ASSEMBLY_API_KEY is missing from .env")
        self.headers = {
            "authorization": ASSEMBLY_API_KEY,
            "content-type": "application/json",
        }

    def _upload(self, file_path: str) -> str:
        """Upload local file to AssemblyAI CDN, return the hosted audio_url."""
        print(f"[AssemblyAI] Uploading {file_path}...")
        upload_headers = {"authorization": ASSEMBLY_API_KEY}
        with open(file_path, "rb") as f:
            res = requests.post(
                f"{BASE_URL}/v2/upload",
                headers=upload_headers,
                data=f,
                timeout=120,
            )
        res.raise_for_status()
        url = res.json()["upload_url"]
        print(f"[AssemblyAI] Uploaded → {url[:60]}...")
        return url

    def transcribe(self, file_path: str) -> dict:
        audio_url = self._upload(file_path)

        print("[AssemblyAI] Starting transcription job...")
        payload = {
            "audio_url": audio_url,
            # ✅ Use "speech_models" (plural, list) — required by new AssemblyAI API
            "speech_models": ["universal-2"],
            "speaker_labels": True,
            # ⚠️  language_detection is NOT compatible with speaker_labels — omitted
        }

        tx_res = requests.post(
            f"{BASE_URL}/v2/transcript",
            headers=self.headers,
            json=payload,
            timeout=30,
        )

        if not tx_res.ok:
            raise RuntimeError(
                f"AssemblyAI transcript request failed ({tx_res.status_code}): {tx_res.text}"
            )

        transcript_id = tx_res.json()["id"]
        print(f"[AssemblyAI] Processing transcript {transcript_id}...")

        # Poll until complete
        while True:
            poll = requests.get(
                f"{BASE_URL}/v2/transcript/{transcript_id}",
                headers=self.headers,
                timeout=30,
            )
            poll.raise_for_status()
            data = poll.json()

            status = data.get("status")
            if status == "completed":
                print("[AssemblyAI] ✅ Transcription complete.")
                break
            elif status == "error":
                raise RuntimeError(f"AssemblyAI error: {data.get('error')}")

            time.sleep(3)

        # Normalize utterances format
        utterances = []
        for u in data.get("utterances") or []:
            utterances.append({
                "speaker": f"SPEAKER_{u.get('speaker', 'A')}",
                "text":    u.get("text", ""),
                "start":   u.get("start", 0) / 1000,
                "end":     u.get("end", 0) / 1000,
            })

        return {
            "text":       data.get("text", ""),
            "utterances": utterances,
        }
