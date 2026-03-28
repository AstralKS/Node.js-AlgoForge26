from app.utils.llm_client import OpenRouterClient
from app.utils.supabase_client import get_supabase
import json


class ReportBuilder:
    """Aggregates week's symptom logs, biometrics, and medication data to generate AI weekly insights."""

    def __init__(self):
        self.llm = OpenRouterClient()
        self.db = get_supabase()

    def _fetch_patient_data(self, patient_id: str) -> dict:
        """Fetches symptoms, biometrics, and medication logs from Supabase."""
        data = {"symptoms": [], "biometrics": [], "medication_logs": [], "patient": None}

        if not self.db:
            return data

        # Get patient info
        patients = self.db.select("patients", {"id": patient_id}, limit=1)
        if patients:
            data["patient"] = patients[0]

        # Get recent symptoms (uses correct `symptoms` table)
        data["symptoms"] = self.db.select(
            "symptoms",
            {"patient_id": patient_id},
            limit=50,
            order="date.desc"
        )

        # Get recent biometrics
        data["biometrics"] = self.db.select(
            "biometrics",
            {"patient_id": patient_id},
            limit=50,
            order="timestamp.desc"
        )

        # Get medication logs
        data["medication_logs"] = self.db.select(
            "medication_logs",
            {"patient_id": patient_id},
            limit=50,
            order="scheduled_time.desc"
        )

        return data

    def build(self, patient_id: str) -> dict:
        patient_data = self._fetch_patient_data(patient_id)

        # Use real data if available, otherwise use sample data for demo
        symptoms = patient_data["symptoms"]
        biometrics = patient_data["biometrics"]
        med_logs = patient_data["medication_logs"]

        if not symptoms and not biometrics:
            symptoms = [
                {"description": "Fever for 2 days", "severity": 6, "source": "whatsapp"},
                {"description": "Coughing badly today", "severity": 5, "source": "whatsapp"},
                {"description": "Still have headache", "severity": 4, "source": "manual"}
            ]

        system_prompt = """
        You are an AI specialized in tracking weekly patient health progression.
        I will provide a JSON object containing the patient's recent symptoms, biometrics,
        and medication adherence logs.

        Generate a comprehensive weekly review highlighting trends, overall health trajectory,
        and a clear report for the doctor to sign.

        JSON FORMAT:
        {
          "summary": "narrative summary of the week",
          "trend": "improving | stable | declining",
          "symptom_frequency": {"symptom_name": count},
          "risk_level": "low | medium | high | critical",
          "key_findings": ["finding 1", "finding 2"],
          "medication_adherence": 85,
          "biometric_trends": {
            "improving": ["metric getting better"],
            "worsening": ["metric getting worse"],
            "stable": ["unchanged metrics"]
          },
          "doctor_action_needed": "None | Review needed | Urgent callback",
          "recommendations": {
            "for_patient": ["recommendation 1"],
            "for_doctor": ["clinical recommendation 1"]
          }
        }
        """

        combined_data = {
            "symptoms": symptoms,
            "biometrics": biometrics,
            "medication_logs": med_logs,
            "patient_diagnosis": patient_data.get("patient", {}).get("current_diagnosis", "Unknown") if patient_data.get("patient") else "Unknown"
        }

        report = self.llm.generate_json(system_prompt, json.dumps(combined_data, default=str))

        # Store the report in Supabase `ai_reports` table
        if self.db and "error" not in report:
            try:
                from datetime import datetime
                self.db.insert("ai_reports", {
                    "patient_id": patient_id,
                    "week_of": datetime.now().strftime("%Y-%m-%d"),
                    "summary": report.get("summary", ""),
                    "risk_level": report.get("risk_level", "low"),
                    "recommendations": json.dumps(report.get("recommendations", {})),
                    "signed_by_doctor": False,
                    "signed_at": None
                })
            except Exception as e:
                print(f"[ReportBuilder] Failed to save report: {e}")

        return report
