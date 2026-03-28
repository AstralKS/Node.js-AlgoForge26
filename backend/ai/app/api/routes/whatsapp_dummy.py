from fastapi import APIRouter
from pydantic import BaseModel
from app.modules.symptom_analysis.analyzer import SymptomAnalyzer
from app.modules.misdiagnosis_monitor.monitor import MisdiagnosisMonitor

router = APIRouter()
analyzer = SymptomAnalyzer()
monitor = MisdiagnosisMonitor()


class WhatsAppMessage(BaseModel):
    patient_id: str
    message: str


@router.post("/whatsapp/webhook")
async def mock_whatsapp_inbound(payload: WhatsAppMessage):
    """
    Simulates receiving WhatsApp data.
    Runs Symptom Analysis + Misdiagnosis Monitor pipeline.
    """
    # 1. AI symptom analysis
    analysis = analyzer.analyze(payload.patient_id, payload.message)

    # 2. Cross-check for misdiagnosis patterns
    misdiag = monitor.check_pattern(payload.patient_id, analysis.get("symptoms", []))

    return {
        "status": "processed",
        "symptom_analysis": analysis,
        "misdiagnosis_check": misdiag
    }
