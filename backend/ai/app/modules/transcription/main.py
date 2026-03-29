"""
main.py — AssemblyAI Real-Time WebSocket Streaming Engine

Runs the live microphone transcript and generates a SOAP note.
"""

import sys
import time
from transcriber import LiveTranscriber
from soap import build_soap_note, save_note

def on_transcript(segments):
    for seg in segments:
        _all_segments.append(seg)

_all_segments = []

def run_live():
    print("\n[LIVE] Starting AssemblyAI Streaming WebSocket...\n")
    t = LiveTranscriber(on_transcript=on_transcript)
    t.start()
    
    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n[LIVE] Stopping and generating SOAP Note...")
        t.stop()

    if _all_segments:
        note = build_soap_note(_all_segments)
        print(f"\n{note}")
        save_note(note)
    else:
        print("[WARN] No speech captured.")

if __name__ == "__main__":
    run_live()
