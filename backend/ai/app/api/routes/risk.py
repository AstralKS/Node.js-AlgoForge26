from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.modules.misdiagnosis_monitor.monitor import MisdiagnosisMonitor

router = APIRouter()
monitor = MisdiagnosisMonitor()


class RiskEvalRequest(BaseModel):
    patient_id: str
    symptoms: Optional[List[str]] = None
    current_diagnosis: Optional[str] = None


@router.post("/risk/evaluate")
async def evaluate_risk(payload: RiskEvalRequest):
    """
    Evaluates misdiagnosis risk based on patient's symptom progression.
    Called by the Node.js backend during periodic risk scans
    or when new concerning symptoms are logged.
    """
    symptoms = payload.symptoms or []

    # If no symptoms provided, fetch recent ones from Supabase
    if not symptoms:
        from app.utils.supabase_client import get_supabase
        db = get_supabase()
        if db:
            recent = db.select("symptoms", {"patient_id": payload.patient_id}, limit=10, order="date.desc")
            symptoms = [s.get("description", "") for s in recent if s.get("description")]

    result = monitor.check_pattern(payload.patient_id, symptoms)
    return {
        "status": "success",
        "risk_evaluation": result
    }
