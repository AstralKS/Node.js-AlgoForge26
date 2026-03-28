from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase
import json
from datetime import datetime, timezone


class SymptomAnalyzer:
    """LLM-based symptom interpretation from patient messages (WhatsApp / manual)."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def analyze(self, patient_id: str, message: str) -> dict:
        system_prompt = """
        You are a clinical AI monitor reading a patient's self-reported message.
        Extract the symptoms, assign a severity score (1-10), and flag if it looks like an emergency.
        Return JSON:
        {
           "symptoms": [
             {"name": "symptom1", "description": "detailed description", "severity": 5, "body_area": "head"}
           ],
           "overall_severity": 5,
           "is_emergency": false,
           "risk_level": "low | medium | high | critical",
           "analysis_notes": "brief clinical reasoning",
           "recommended_actions": ["action1", "action2"]
        }
        """

        analysis = self.llm.generate_json(system_prompt, f"Patient Message: {message}")

        # Store each extracted symptom in the Supabase `symptoms` table
        # (matches the Node.js backend schema exactly)
        if self.db and "error" not in analysis:
            symptoms_list = analysis.get("symptoms", [])
            for symptom in symptoms_list:
                try:
                    self.db.insert("symptoms", {
                        "patient_id": patient_id,
                        "date": datetime.now(timezone.utc).isoformat(),
                        "description": symptom.get("description", symptom.get("name", "Unknown")),
                        "severity": min(max(int(symptom.get("severity", 5)), 1), 10),
                        "source": "whatsapp",
                        "ai_analysis": json.dumps(analysis)
                    })
                except Exception as e:
                    print(f"[SymptomAnalyzer] Failed to insert symptom: {e}")

        return analysis

    def get_patient_symptoms(self, patient_id: str, limit: int = 20) -> list:
        """Fetch recent symptoms for a patient from Supabase."""
        if not self.db:
            return []
        return self.db.select(
            "symptoms",
            filters={"patient_id": patient_id},
            limit=limit,
            order="date.desc"
        )
