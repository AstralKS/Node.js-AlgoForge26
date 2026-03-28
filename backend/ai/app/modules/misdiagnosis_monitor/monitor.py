from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase
import json
from datetime import datetime, timezone


class MisdiagnosisMonitor:
    """Compares new symptoms against initial diagnosis to detect danger patterns."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def _get_patient_diagnosis(self, patient_id: str) -> str:
        """Fetches the patient's current diagnosis from Supabase."""
        if not self.db:
            return "Unknown"
        patients = self.db.select("patients", {"id": patient_id}, limit=1)
        if patients and len(patients) > 0:
            return patients[0].get("current_diagnosis", "Unknown")
        return "Unknown"

    def check_pattern(self, patient_id: str, new_symptoms: list) -> dict:
        # Fetch actual diagnosis from Supabase instead of hardcoding
        initial_diagnosis = self._get_patient_diagnosis(patient_id)

        system_prompt = f"""
        You are a medical risk detection AI.
        The patient was originally diagnosed with: '{initial_diagnosis}'.
        They are now presenting new symptoms: {new_symptoms}.

        Analyze if this represents a worsening condition or a potential misdiagnosis
        (e.g., they actually have Malaria, Dengue, Typhoid, COVID, or another condition).
        Return strict JSON:
        {{
            "risk_alert_needed": true,
            "suspected_condition": "condition name or null",
            "diagnosis_match_score": 75,
            "justification": "clinical reasoning",
            "alert_doctor": true,
            "severity": "low | medium | high | critical"
        }}
        """

        result = self.llm.generate_json(system_prompt, "Evaluate the symptom pattern now.")

        # Save alert to Supabase `alerts` table if doctor needs notification
        # Uses the correct schema matching the Node.js backend
        if self.db and result.get("alert_doctor") is True:
            try:
                # Get the assigned doctor for this patient
                patients = self.db.select("patients", {"id": patient_id}, limit=1)
                doctor_id = None
                if patients and len(patients) > 0:
                    doctor_id = patients[0].get("assigned_doctor_id")

                alert_type = "critical" if result.get("severity") in ["high", "critical"] else "weekly"
                self.db.insert("alerts", {
                    "patient_id": patient_id,
                    "doctor_id": doctor_id,
                    "type": alert_type,
                    "message": f"Misdiagnosis risk: {result.get('suspected_condition', 'Review needed')}",
                    "ai_explanation": json.dumps(result),
                    "read": False
                })
            except Exception as e:
                print(f"[MisdiagnosisMonitor] Failed to insert alert: {e}")

        return result
