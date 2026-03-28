"""
soap.py — SOAP clinical note generator using BERT Medical NER
Extracts entities dynamically using HuggingFace 'd4data/biomedical-ner-all'.
"""

import os
from collections import defaultdict

# Suppress noisy huggingface warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["transformers_verbosity"] = "error"

_ner_pipeline = None

def _get_ner():
    """Lazy load the HuggingFace pipeline so we don't block instant script startups."""
    global _ner_pipeline
    if _ner_pipeline is None:
        from transformers import pipeline, logging
        logging.set_verbosity_error()
        print("\n[SOAP] Loading Medical NLP model (~400MB on first run)...")
        # aggregation_strategy="simple" automatically merges BIO subwords into full words
        _ner_pipeline = pipeline(
            "token-classification", 
            model="d4data/biomedical-ner-all", 
            aggregation_strategy="simple"
        )
        print("[SOAP] NLP Engine ready.")
    return _ner_pipeline


def _extract(text: str) -> dict:
    """Run medical BERT and group extracted entities by category."""
    if not text.strip():
        return {"symptoms": [], "medications": [], "diseases": [], "dosages": [], "durations": []}

    ner = _get_ner()
    results = ner(text)
    
    extracted = defaultdict(list)
    for entity in results:
        # entity groups from d4data: 'Sign_symptom', 'Disease_disorder', 'Medication', 'History', etc.
        group = entity['entity_group']
        word = entity['word'].strip().lower()
        
        # Merge scattered pieces due to tokenizer (e.g. "head ##ache")
        word = word.replace(" ##", "") 
        
        if word and word not in extracted[group]:
            extracted[group].append(word)

    # Map the model's technical tags into our SOAP categories
    return {
        "symptoms":    extracted.get("Sign_symptom", []),
        "diseases":    extracted.get("Disease_disorder", []),
        "medications": extracted.get("Medication", []),
        "dosages":     extracted.get("Dosage", []),
        "durations":   extracted.get("Duration", []) + extracted.get("Frequency", [])
    }


# ── SOAP builder ──────────────────────────────────────────────────────────────

def build_soap_note(speaker_segments: list[dict], roles: dict[str, str] | None = None) -> str:
    """
    Build a SOAP note from labelled transcript segments.
    speaker_segments: [{start, end, text, speaker}, ...]
    roles:            {speaker_id: "Doctor" | "Patient"}
    """
    roles = roles or {}

    patient_text, doctor_text = [], []
    for seg in speaker_segments:
        role = roles.get(seg.get("speaker", ""), "Patient")
        (doctor_text if role == "Doctor" else patient_text).append(seg["text"])

    full_text    = " ".join(patient_text + doctor_text)
    patient_full = " ".join(patient_text)
    doctor_full  = " ".join(doctor_text)

    # Extract all clinical entities from the full conversation
    e = _extract(full_text)

    # ── S: Subjective ─────────────────────────────────────────────────────────
    s = []
    if e["symptoms"]:
        s.append("Symptoms reported: " + ", ".join(e["symptoms"]))
    if e["durations"]:
        s.append("Reported duration/frequency: " + ", ".join(e["durations"]))
    if not s:
        s.append((patient_full[:140] + "…") if patient_full else "No subjective complaints transcribed")

    # ── O: Objective ──────────────────────────────────────────────────────────
    o = []
    if doctor_full:
        o.append("Clinician notes: " + (doctor_full[:140] + "…" if len(doctor_full) > 140 else doctor_full))
    else:
        o.append("No independent clinician observations recorded")

    # ── A: Assessment ─────────────────────────────────────────────────────────
    a = []
    if e["diseases"]:
        a.append("Findings/Disorders: " + ", ".join(e["diseases"]))
    elif e["symptoms"]:
        a.append("Presenting with: " + ", ".join(e["symptoms"][:3]))
    a.append("Further evaluation required for definitive diagnosis")

    # ── P: Plan ───────────────────────────────────────────────────────────────
    p = []
    meds   = e["medications"]
    doses  = e["dosages"]
    
    for i, med in enumerate(meds):
        parts = [f"Prescribe {med}"]
        if i < len(doses):
            parts.append(doses[i])
        p.append(" ".join(parts))
        
    if not p:
        p.append("Treatment plan to be determined")

    def sec(title, items):
        return f"{title}\n" + "\n".join(f"  • {item}" for item in items)

    return "\n".join([
        "=" * 52,
        "        SOAP CLINICAL NOTE (BERT Analysis)",
        "=" * 52,
        sec("S — Subjective (Patient Reports):", s),
        sec("O — Objective (Clinician Findings):", o),
        sec("A — Assessment:", a),
        sec("P — Plan:", p),
        "=" * 52,
    ])


def save_note(note: str, path: str = "clinical_note.txt"):
    with open(path, "w", encoding="utf-8") as f:
        f.write(note)
    print(f"[SOAP] Note saved → {path}")
