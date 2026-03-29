"""
transcriber.py — AssemblyAI Real-Time WebSocket Streaming Engine
Solves multilingual + multi-speaker problem using u3-rt-pro

Replaces the massive local models with an ultra-fast WebSocket connection.
Uses sounddevice (100% stable on Windows Python 3.14) instead of PyAudio.
"""

import os
import json
import threading
import time
import queue
from urllib.parse import urlencode

import numpy as np
import sounddevice as sd
import websocket
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

API_KEY = os.getenv("ASSEMBLY_API_KEY", "")

# AssemblyAI parameters requested for multi-speaker multilingual streaming
CONNECTION_PARAMS = {
    "sample_rate": 16000,
    "speech_model": "u3-rt-pro",    # Handled English/Hindi automatically
    "speaker_labels": "true",       # Enables real-time speaker diarization
}

API_ENDPOINT = f"wss://streaming.assemblyai.com/v3/ws?{urlencode(CONNECTION_PARAMS)}"
SAMPLE_RATE = CONNECTION_PARAMS["sample_rate"]
FRAMES_PER_BUFFER = 800  # 50ms


class LiveTranscriber:
    """
    Captures mic audio via sounddevice and streams to AssemblyAI over WebSocket.
    Fires on_transcript([{"start": ..., "end": ..., "text": ..., "speaker": ...}]) 
    for Final/Turn transcripts so the SOAP generator can build the report.
    """

    def __init__(self, on_transcript=None):
        if not API_KEY:
            raise ValueError("ASSEMBLY_API_KEY is missing from .env")
            
        self.on_transcript = on_transcript or (lambda segs: None)
        self._running = False
        self.ws_app = None
        self.ws_thread = None
        self.stream = None
        
        # We need byte conversion for WebSocket
        self.audio_queue = queue.Queue()
        self._elapsed_time = 0.0

    def _audio_callback(self, indata, frames, time_info, status):
        if status:
            print(f"[MIC] {status}")
        # Convert float32 from sounddevice to Int16 bytes required by AssemblyAI
        audio_data = (indata[:, 0] * 32767).astype(np.int16).tobytes()
        self.audio_queue.put(audio_data)

    def _on_ws_open(self, ws):
        print("\n[WS] Connected to AssemblyAI...")
        
        def stream_audio():
            while self._running:
                try:
                    audio_chunk = self.audio_queue.get(timeout=1)
                    ws.send(audio_chunk, websocket.ABNF.OPCODE_BINARY)
                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"[WS] Error streaming audio: {e}")
                    break

        self.audio_sender_thread = threading.Thread(target=stream_audio, daemon=True)
        self.audio_sender_thread.start()

    def _on_ws_message(self, ws, message):
        try:
            data = json.loads(message)
            msg_type = data.get('type', data.get('message_type'))

            if msg_type == "SessionBegins":
                if self._running: print(f"[WS] Session ID: {data.get('session_id')}")
            
            # Universal v3 streaming returns PartialTranscript / FinalTranscript 
            elif msg_type == "PartialTranscript":
                text = data.get("text", "")
                if text and self._running:
                    # Carriage return to print in place like the original script
                    print(f"\r[Partial] {text[:80]:<80}", end='', flush=True)

            elif msg_type == "FinalTranscript":
                text = data.get("text", "")
                if not text: return
                
                # Blank the partial line
                if self._running: print('\r' + ' ' * 100 + '\r', end='')
                
                speaker = data.get("speaker", "UNKNOWN")
                start = data.get("audio_start", 0) / 1000.0
                end = data.get("audio_end", 0) / 1000.0

                if self._running: print(f"[{start:.1f}s] [{speaker}] {text}")

                # Pass formatted data to our pipeline (even if not printing, to catch final words)
                self.on_transcript([{
                    "start": start,
                    "end": end,
                    "text": text,
                    "speaker": speaker
                }])

            # Handling for "Turn" messages from conversational demo code
            elif msg_type == "Turn":
                text = data.get('transcript', '')
                if text:
                    if self._running:
                        print('\r' + ' ' * 100 + '\r', end='')
                        print(f"[Turn] {text}")
                    self.on_transcript([{
                        "start": self._elapsed_time,
                        "end": self._elapsed_time + 1.0,
                        "text": text,
                        "speaker": "UNKNOWN", 
                    }])
                    self._elapsed_time += 1.0

            elif msg_type == "Error":
                if self._running: print(f"\n[WS ERROR] {data.get('error')}")

        except Exception as e:
            pass # Ignore malformed json

    def _on_ws_error(self, ws, error):
        print(f"\n[WS] WebSocket Error: {error}")

    def _on_ws_close(self, ws, close_status_code, close_msg):
        print(f"\n[WS] Disconnected: Status={close_status_code}")

    def start(self):
        self._running = True

        # 1. Start Mic
        self.stream = sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype="float32",
            blocksize=FRAMES_PER_BUFFER,
            callback=self._audio_callback,
        )
        self.stream.start()

        # 2. Start WebSocket
        self.ws_app = websocket.WebSocketApp(
            API_ENDPOINT,
            header={"Authorization": API_KEY},
            on_open=self._on_ws_open,
            on_message=self._on_ws_message,
            on_error=self._on_ws_error,
            on_close=self._on_ws_close,
        )
        self.ws_thread = threading.Thread(target=self.ws_app.run_forever, daemon=True)
        self.ws_thread.start()

    def stop(self):
        self._running = False
        
        # Stop mic
        if self.stream:
            try:
                self.stream.stop()
                self.stream.close()
            except:
                pass
            
        # Send termination
        if self.ws_app and self.ws_app.sock:
            try:
                self.ws_app.send(json.dumps({"terminate_session": True}))
                time.sleep(0.5)
            except:
                pass
            self.ws_app.close()
            
        if self.ws_thread:
            self.ws_thread.join(timeout=2)
