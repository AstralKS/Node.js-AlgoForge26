from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase
import json

class MisdiagnosisMonitor:
    """Compares new symptoms against initial diagnosis to detect danger patterns."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def check_pattern(self, patient_id: str, new_symptoms: list) -> dict:
        # In production: query supabase for the patient's initial diagnosis
        initial_diagnosis = "common cold"

        system_prompt = f"""
        You are a medical risk detection AI.
        The patient was originally diagnosed with: '{initial_diagnosis}'.
        They are now presenting new symptoms: {new_symptoms}.

        Analyze if this represents a worsening condition or a potential misdiagnosis
        (e.g., they actually have Malaria, Dengue, Typhoid, COVID).
        Return strict JSON:
        {{
            "risk_alert_needed": true,
            "suspected_condition": "condition name or null",
            "justification": "clinical reasoning",
            "alert_doctor": true
        }}
        """

        result = self.llm.generate_json(system_prompt, "Evaluate the symptom pattern now.")

        # Save alert to Supabase if doctor needs notification
        if self.db and result.get("alert_doctor") is True:
            self.db.insert("doctor_alerts", {
                "patient_id": patient_id,
                "alert_payload": json.dumps(result)
            })

        return result
