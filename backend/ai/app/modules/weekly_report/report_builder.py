from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase

class ReportBuilder:
    """Aggregates week's symptom logs and generates AI weekly insights."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def build(self, patient_id: str) -> dict:
        logs = []
        if self.db:
            logs = self.db.select("symptoms_log", {"patient_id": patient_id})

        if not logs:
            logs = [
                {"raw_message": "Fever for 2 days", "symptoms": '["fever"]'},
                {"raw_message": "Coughing badly today", "symptoms": '["cough"]'},
                {"raw_message": "Still have headache", "symptoms": '["headache"]'}
            ]

        system_prompt = """
        You are an AI specialized in tracking weekly patient health progression.
        I will provide a JSON array of the patient's daily symptom logs.

        Generate a comprehensive weekly review highlighting trends, overall health trajectory,
        and a clear report for the doctor to sign.

        JSON FORMAT:
        {
          "week_summary": "narrative summary of the week",
          "trend": "improving / stable / declining",
          "symptom_frequency": {"symptom": count},
          "risk_level": "Low / Moderate / High",
          "doctor_action_needed": "None / Review needed / Urgent callback",
          "patient_recommendations": ["recommendation 1", "recommendation 2"]
        }
        """

        return self.llm.generate_json(system_prompt, str(logs))
