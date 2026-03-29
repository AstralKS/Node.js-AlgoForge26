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
    Returns a formatted text block.
    """
    d = build_soap_dict(speaker_segments, roles)

    def sec(title, text):
        return f"{title}\n  • {text}"

    return "\n".join([
        "=" * 52,
        "        SOAP CLINICAL NOTE (BERT Analysis)",
        "=" * 52,
        sec("S — Subjective (Patient Reports):", d["subjective"]),
        sec("O — Objective (Clinician Findings):", d["objective"]),
        sec("A — Assessment:", d["assessment"]),
        sec("P — Plan:", d["plan"]),
        "=" * 52,
    ])


def build_soap_dict(speaker_segments: list[dict], roles: dict[str, str] | None = None) -> dict:
    """
    Build a structured dict SOAP note from labelled transcript segments.
    Returns {subjective, objective, assessment, plan} as plain strings.
    """
    roles = roles or {}

    patient_text, doctor_text = [], []
    for seg in speaker_segments:
        role = roles.get(seg.get("speaker", ""), "Patient")
        (doctor_text if role == "Doctor" else patient_text).append(seg["text"])

    full_text    = " ".join(patient_text + doctor_text)
    patient_full = " ".join(patient_text)
    doctor_full  = " ".join(doctor_text)

    e = _extract(full_text)

    # S — Subjective
    s_parts = []
    if e["symptoms"]:
        s_parts.append("Symptoms reported: " + ", ".join(e["symptoms"]))
    if e["durations"]:
        s_parts.append("Duration/frequency: " + ", ".join(e["durations"]))
    if not s_parts:
        s_parts.append((patient_full[:200] + "…") if patient_full else "No subjective complaints transcribed")
    subjective = "; ".join(s_parts)

    # O — Objective
    if doctor_full:
        objective = "Clinician notes: " + (doctor_full[:200] + "…" if len(doctor_full) > 200 else doctor_full)
    else:
        objective = "No independent clinician observations recorded"

    # A — Assessment
    a_parts = []
    if e["diseases"]:
        a_parts.append("Findings: " + ", ".join(e["diseases"]))
    elif e["symptoms"]:
        a_parts.append("Presenting with: " + ", ".join(e["symptoms"][:3]))
    a_parts.append("Further evaluation required for definitive diagnosis")
    assessment = "; ".join(a_parts)

    # P — Plan
    p_parts = []
    for i, med in enumerate(e["medications"]):
        dose = e["dosages"][i] if i < len(e["dosages"]) else ""
        p_parts.append(f"Prescribe {med}" + (f" {dose}" if dose else ""))
    if not p_parts:
        p_parts.append("Treatment plan to be determined")
    plan = "; ".join(p_parts)

    return {
        "subjective": subjective,
        "objective":  objective,
        "assessment": assessment,
        "plan":       plan,
    }




def save_note(note: str, path: str = "clinical_note.txt"):
    with open(path, "w", encoding="utf-8") as f:
        f.write(note)
    print(f"[SOAP] Note saved → {path}")
