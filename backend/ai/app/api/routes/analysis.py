from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.modules.symptom_analysis.analyzer import SymptomAnalyzer

router = APIRouter()
analyzer = SymptomAnalyzer()


class SymptomAnalysisRequest(BaseModel):
    patient_id: str
    text: str
    patient_history: Optional[str] = None


class BatchAnalysisRequest(BaseModel):
    patient_id: str
    messages: List[str]


@router.post("/analyze/symptoms")
async def analyze_symptoms(payload: SymptomAnalysisRequest):
    """
    Analyzes patient symptoms via AI and stores results in Supabase.
    Called by the Node.js backend during WhatsApp message processing
    or manual symptom submission.
    """
    analysis = analyzer.analyze(payload.patient_id, payload.text)
    return {
        "status": "success",
        "analysis": analysis
    }


@router.post("/analyze/batch")
async def batch_analyze(payload: BatchAnalysisRequest):
    """Process multiple messages in sequence (e.g., daily WhatsApp check-in batch)."""
    results = []
    for msg in payload.messages:
        result = analyzer.analyze(payload.patient_id, msg)
        results.append(result)
    return {
        "status": "success",
        "count": len(results),
        "analyses": results
    }


@router.get("/analyze/history/{patient_id}")
async def get_analysis_history(patient_id: str, limit: int = 20):
    """Fetch recent symptom analyses for a patient."""
    symptoms = analyzer.get_patient_symptoms(patient_id, limit)
    return {
        "status": "success",
        "count": len(symptoms),
        "symptoms": symptoms
    }
