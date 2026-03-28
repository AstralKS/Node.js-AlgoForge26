# Medical Transcription System

Real-time medical conversation transcription with speaker role detection, entity extraction, and SOAP note generation.

## Pipeline
```
Mic Audio
    ↓ (sounddevice, 3s chunks)
Silero-VAD  (skip silence → no hallucinations)
    ↓
faster-whisper small int8  (fast ASR)
    ↓
Speaker Diarization  (pyannote or heuristic fallback)
    ↓
Doctor/Patient Classifier  (keyword + question heuristic ML)
    ↓
Medical NER  (scispaCy BC5CDR)
    ↓
SOAP Note Generator
```

## Files
| File | Purpose |
|------|---------|
| `main.py` | Entry point – live / file / demo modes |
| `transcriber.py` | faster-whisper + VAD streaming engine |
| `diarizer.py` | Speaker diarization + Doctor/Patient role labelling |
| `ner.py` | Medical entity extraction (scispaCy + regex) |
| `soap.py` | SOAP clinical note builder |

## Setup

```bash
# 1. Install base dependencies
pip install -r requirements.txt

# 2. Install scispaCy medical NER model
pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_ner_bc5cdr_md-0.5.4.tar.gz

# 3. Set HuggingFace token (needed for pyannote diarization)
#    Accept model at: https://huggingface.co/pyannote/speaker-diarization-3.1
set HF_TOKEN=hf_your_token_here
```

## Run

```bash
# Demo mode (no mic, no GPU, instant)
python main.py --demo

# Live mic transcription (Ctrl+C to stop and get report)
python main.py

# Process a saved WAV file (full diarization + NER + SOAP)
python main.py --file consultation.wav
```

## Output Example

```
[Doctor] Are you experiencing chest pain?
[Patient] Yes, mostly after walking. Started 3 days ago.

Entities:
  Symptoms    : chest pain, nausea
  Medications : paracetamol, aspirin
  Durations   : 3 days

==================================================
SOAP CLINICAL NOTE
==================================================
S (Subjective):
  Symptoms: chest pain, nausea
  Duration: 3 days
O (Objective):
  ...
A (Assessment):
  Possible condition(s): ...
P (Plan):
  Prescribe paracetamol 500mg
  Prescribe aspirin 100mg
==================================================
```

## Notes
- **No GPU?** Works on CPU with `int8` quantization (model=`tiny` is fastest).
- **No HF token?** Diarization falls back to energy-based heuristic automatically.
- **No scispaCy model?** NER falls back to keyword + regex extraction automatically.
