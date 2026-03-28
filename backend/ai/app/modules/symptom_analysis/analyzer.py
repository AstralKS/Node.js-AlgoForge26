from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase
import json

class SymptomAnalyzer:
    """LLM-based symptom interpretation from patient messages (WhatsApp dummy data)."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def analyze(self, patient_id: str, message: str) -> dict:
        system_prompt = """
        You are a clinical AI monitor reading a patient's self-reported message.
        Extract the symptoms, assign a severity score (1-10), and flag if it looks like an emergency.
        Return JSON:
        {
           "symptoms": ["symptom1", "symptom2"],
           "severity_score": 5,
           "is_emergency": false,
           "analysis_notes": "brief clinical reasoning"
        }
        """

        analysis = self.llm.generate_json(system_prompt, f"Patient Message: {message}")

        # Store in Supabase
        if self.db and "error" not in analysis:
            self.db.insert("symptoms_log", {
                "patient_id": patient_id,
                "raw_message": message,
                "symptoms": json.dumps(analysis.get("symptoms", [])),
                "severity": analysis.get("severity_score", 0),
                "ai_notes": analysis.get("analysis_notes", "")
            })

        return analysis
