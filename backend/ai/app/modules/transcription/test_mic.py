"""
test_mic.py — Live AssemblyAI WebSocket Mic Test

Records from your default microphone using sounddevice.
Streams audio over WebSocket directly to AssemblyAI (no local HF downloads!).
Handles Diarization (multi-speaker) and Multilingual automatically.

Run:
    python test_mic.py
"""

import sys
import time
from transcriber import LiveTranscriber
from soap import build_soap_note

OUTPUT_FILE = "data.txt"

all_segments = []

def on_transcript(segments):
    for seg in segments:
        all_segments.append(seg)
        # The transcriber already prints live output, we just collect it here

if __name__ == "__main__":
    t = LiveTranscriber(on_transcript=on_transcript)
    
    print("🎙  Starting AssemblyAI Streaming WebSocket...")
    t.start()
    
    # Give the WebSocket a second to connect before prompting the user
    time.sleep(1)
    print("\n👉 Speak now! Try English, Hindi, or multiple speakers.")
    print("👉 Press Ctrl+C to stop, generate SOAP note, and save to data.txt\n")

    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n\n[STOP] Stopping stream and generating report...")
        t.stop()

    if not all_segments:
        print("[WARN] No speech segments finalized. Try speaking longer.")
        sys.exit(0)

    # Build SOAP note
    note = build_soap_note(all_segments)

    # Prepare raw transcript log
    lines = ["=" * 52, "RAW TRANSCRIPT", "=" * 52]
    for seg in all_segments:
        # In case speaker is None or omitted
        spkr = seg.get('speaker', 'UKNOWN')
        lines.append(f"[{seg.get('start', 0.0):.1f}s] [{spkr}] {seg.get('text', '')}")

    lines += ["", note]

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\n{note}")
    print(f"\n✅  Saved → {OUTPUT_FILE}")
