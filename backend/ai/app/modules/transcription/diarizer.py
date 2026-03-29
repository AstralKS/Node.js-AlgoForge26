"""
Speaker diarization: who spoke when.
Uses pyannote.audio (offline, HF token required).
Falls back to a simple energy-based heuristic if pyannote fails.

Usage:
    from diarizer import diarize_file, assign_speaker
    turns = diarize_file("audio.wav")
    # turns -> [{start, end, speaker}, ...]
    text_with_speaker = assign_speaker(turns, segments)
"""

import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
HF_TOKEN = os.getenv("HF_TOKEN", "")


def diarize_file(audio_path: str, hf_token: str = HF_TOKEN, num_speakers: int = 2):
    """
    Run speaker diarization on a WAV file.
    Returns list of {start, end, speaker} dicts.
    """
    try:
        import torch
        from pyannote.audio import Pipeline

        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=hf_token,
        )
        if torch.cuda.is_available():
            pipeline.to(torch.device("cuda"))

        diarization = pipeline(audio_path, num_speakers=num_speakers)
        turns = [
            {"start": turn.start, "end": turn.end, "speaker": speaker}
            for turn, _, speaker in diarization.itertracks(yield_label=True)
        ]
        return turns

    except Exception as e:
        print(f"[DIARIZE] pyannote failed ({e}), using heuristic fallback")
        return _heuristic_diarize(audio_path)


def _heuristic_diarize(audio_path: str):
    """
    Extremely simple energy-based 2-speaker split (no ML).
    Splits audio into fixed windows and alternates speakers
    based on RMS energy changes.  Good enough for demo.
    """
    import wave, numpy as np

    with wave.open(audio_path, "rb") as wf:
        n_frames = wf.getnframes()
        sr = wf.getframerate()
        raw = wf.readframes(n_frames)

    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    window = int(sr * 1.5)   # 1.5-second windows
    turns = []
    prev_rms, prev_speaker = 0.0, "SPEAKER_00"

    for i in range(0, len(audio) - window, window):
        chunk = audio[i : i + window]
        rms = float(np.sqrt(np.mean(chunk ** 2)))
        # flip speaker when energy jumps significantly
        speaker = (
            "SPEAKER_01" if (rms > prev_rms * 1.5 and prev_speaker == "SPEAKER_00")
            else prev_speaker
        )
        turns.append({
            "start": i / sr,
            "end": (i + window) / sr,
            "speaker": speaker,
        })
        prev_rms, prev_speaker = rms, speaker

    return turns


def assign_speaker(turns: list[dict], segments: list[dict]) -> list[dict]:
    """
    Merge diarization turns with ASR segments.
    Returns segments enriched with a 'speaker' key.
    """
    enriched = []
    for seg in segments:
        mid = (seg["start"] + seg["end"]) / 2
        speaker = "UNKNOWN"
        for turn in turns:
            if turn["start"] <= mid <= turn["end"]:
                speaker = turn["speaker"]
                break
        enriched.append({**seg, "speaker": speaker})
    return enriched


def label_roles(speaker_segments: list[dict]) -> dict[str, str]:
    """
    ML heuristic: classify each speaker as Doctor or Patient.

    Doctors tend to: ask more questions, use medical terms, shorter turns.
    Patients tend to: describe symptoms, speak longer narratives.

    Returns {speaker_id: role} e.g. {"SPEAKER_00": "Doctor", "SPEAKER_01": "Patient"}
    """
    MEDICAL_KEYWORDS = {
        "prescribed", "diagnos", "symptoms", "medication", "treatment",
        "dosage", "mg", "tablet", "injection", "refer", "test", "result",
        "blood", "pressure", "fever", "pain", "examination",
    }

    stats: dict[str, dict] = {}
    for seg in speaker_segments:
        sp = seg["speaker"]
        txt = seg["text"].lower()
        if sp not in stats:
            stats[sp] = {"questions": 0, "medical": 0, "chars": 0, "turns": 0}
        stats[sp]["questions"] += txt.count("?")
        stats[sp]["medical"]   += sum(1 for kw in MEDICAL_KEYWORDS if kw in txt)
        stats[sp]["chars"]     += len(txt)
        stats[sp]["turns"]     += 1

    roles: dict[str, str] = {}
    for sp, s in stats.items():
        avg_len   = s["chars"] / max(s["turns"], 1)
        doc_score = s["questions"] * 2 + s["medical"] * 3 - avg_len * 0.05
        roles[sp] = "Doctor" if doc_score > 0 else "Patient"

    return roles
