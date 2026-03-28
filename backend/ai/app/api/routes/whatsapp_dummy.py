from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.modules.symptom_analysis.analyzer import SymptomAnalyzer
from app.modules.misdiagnosis_monitor.monitor import MisdiagnosisMonitor
from app.modules.whatsapp_ai.intent_classifier import IntentClassifier
from app.modules.whatsapp_ai.data_extractor import DataExtractor
from app.modules.whatsapp_ai.response_builder import ResponseBuilder
from app.utils.supabase_client import get_supabase
import json
from datetime import datetime, timezone

router = APIRouter()
analyzer = SymptomAnalyzer()
monitor = MisdiagnosisMonitor()
classifier = IntentClassifier()
extractor = DataExtractor()
responder = ResponseBuilder()


class WhatsAppMessage(BaseModel):
    patient_id: str
    message: str


class WhatsAppProcessRequest(BaseModel):
    patient_id: str
    message: str
    from_number: Optional[str] = None


@router.post("/whatsapp/webhook")
async def mock_whatsapp_inbound(payload: WhatsAppMessage):
    """
    Simulates receiving WhatsApp data.
    Runs full AI pipeline: Intent → Extract → Analyze → Misdiagnosis Check → Store.
    """
    db = get_supabase()

    # 1. Classify intent
    intent_result = classifier.classify(payload.message)
    intent = intent_result.get("intent", "log_symptom") if isinstance(intent_result, dict) else intent_result

    # 2. Extract structured data
    extracted = extractor.extract(payload.message)

    # 3. AI symptom analysis (if symptom-related)
    analysis = None
    if intent in ["log_symptom", "urgent_alert"]:
        analysis = analyzer.analyze(payload.patient_id, payload.message)

    # 4. Cross-check for misdiagnosis patterns
    misdiag = None
    symptoms_for_check = []
    if analysis and analysis.get("symptoms"):
        symptoms_for_check = [s.get("name", s.get("description", "")) for s in analysis["symptoms"]]
    elif extracted.get("symptoms_found"):
        symptoms_for_check = [s.get("name", str(s)) for s in extracted["symptoms_found"]]

    if symptoms_for_check:
        misdiag = monitor.check_pattern(payload.patient_id, symptoms_for_check)

    # 5. Store biometrics if extracted
    if db and extracted.get("biometrics"):
        biometrics = extracted["biometrics"]
        if isinstance(biometrics, dict):
            for bio_type, value in biometrics.items():
                if value is not None:
                    unit_map = {
                        "temperature": "°F", "blood_pressure": "mmHg",
                        "heart_rate": "bpm", "glucose": "mg/dL",
                        "weight": "kg", "spo2": "%"
                    }
                    # Map to the biometrics table type enum
                    type_map = {
                        "temperature": "temperature", "blood_pressure": "bp",
                        "heart_rate": "heart_rate", "glucose": "glucose",
                        "weight": "weight", "spo2": "spo2"
                    }
                    try:
                        db.insert("biometrics", {
                            "patient_id": payload.patient_id,
                            "type": type_map.get(bio_type, bio_type),
                            "value": str(value),
                            "unit": unit_map.get(bio_type, ""),
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                    except Exception as e:
                        print(f"[WhatsApp] Failed to store biometric {bio_type}: {e}")

    # 6. Build conversational response
    response_text = responder.build(intent, extracted)

    return {
        "status": "processed",
        "intent": intent_result,
        "extracted_data": extracted,
        "symptom_analysis": analysis,
        "misdiagnosis_check": misdiag,
        "whatsapp_reply": response_text
    }


@router.post("/whatsapp/process")
async def process_whatsapp_message(payload: WhatsAppProcessRequest):
    """
    Full WhatsApp message processing endpoint.
    Called by the Node.js backend when a real WhatsApp message arrives.
    Returns structured data for the backend to store and respond.
    """
    # Same pipeline as webhook but returns data for the Node.js backend to handle
    intent_result = classifier.classify(payload.message)
    intent = intent_result.get("intent", "log_symptom") if isinstance(intent_result, dict) else intent_result

    extracted = extractor.extract(payload.message)
    analysis = None

    if intent in ["log_symptom", "urgent_alert", "log_biometric"]:
        analysis = analyzer.analyze(payload.patient_id, payload.message)

    misdiag = None
    if intent == "urgent_alert" or (analysis and analysis.get("risk_level") in ["high", "critical"]):
        symptoms_list = []
        if analysis and analysis.get("symptoms"):
            symptoms_list = [s.get("name", "") for s in analysis["symptoms"]]
        misdiag = monitor.check_pattern(payload.patient_id, symptoms_list)

    response_text = responder.build(intent, extracted)

    return {
        "status": "success",
        "intent": intent,
        "intent_details": intent_result,
        "extracted_data": extracted,
        "analysis": analysis,
        "risk_check": misdiag,
        "suggested_reply": response_text,
        "urgency": extracted.get("urgency", analysis.get("risk_level", "low") if analysis else "low"),
        "needs_doctor_attention": (
            intent == "urgent_alert" or
            intent == "ask_doctor" or
            (misdiag and misdiag.get("alert_doctor") is True)
        )
    }
