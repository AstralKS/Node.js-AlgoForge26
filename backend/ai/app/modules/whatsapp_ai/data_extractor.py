from app.utils.llm_client import OpenRouterClient


class DataExtractor:
    """LLM-powered data extraction from WhatsApp free-text messages."""

    def __init__(self):
        self.llm = OpenRouterClient()

    def extract(self, text: str) -> dict:
        """
        Uses AI to pull symptom logs, biometrics, and medication info
        from free-text WhatsApp messages.
        Returns structured data matching the backend DB models.
        """
        system_prompt = """
        You are a medical data extraction AI. Parse the patient's WhatsApp message
        and extract structured health data.

        Return JSON with this exact structure:
        {
          "symptoms_found": [
            {"name": "symptom", "description": "details", "severity": 5}
          ],
          "biometrics": {
            "temperature": null,
            "blood_pressure": null,
            "heart_rate": null,
            "glucose": null,
            "weight": null,
            "spo2": null
          },
          "medication_updates": [
            {"name": "medicine name", "taken": true, "notes": "any notes"}
          ],
          "patient_mood": "good | neutral | poor | distressed",
          "urgency": "low | medium | high | critical"
        }

        Only include values that are explicitly mentioned. Use null for unmentioned biometrics.
        Severity should be 1-10 scale.
        """

        result = self.llm.generate_json(system_prompt, f"Patient WhatsApp message: {text}")

        if "error" in result:
            # Fallback to basic keyword extraction
            return self._basic_extract(text)

        return result

    def _basic_extract(self, text: str) -> dict:
        """Fallback keyword-based extraction if LLM fails."""
        symptoms_found = []
        if "fever" in text.lower() or "बुखार" in text.lower():
            symptoms_found.append({"name": "fever", "description": "fever reported", "severity": 5})
        if "cough" in text.lower() or "खांसी" in text.lower():
            symptoms_found.append({"name": "cough", "description": "cough reported", "severity": 4})
        if "headache" in text.lower() or "सिरदर्द" in text.lower():
            symptoms_found.append({"name": "headache", "description": "headache reported", "severity": 4})
        if "pain" in text.lower() or "दर्द" in text.lower():
            symptoms_found.append({"name": "pain", "description": "pain reported", "severity": 5})

        return {
            "symptoms_found": symptoms_found,
            "biometrics": {
                "temperature": None,
                "blood_pressure": None,
                "heart_rate": None,
                "glucose": None,
                "weight": None,
                "spo2": None
            },
            "medication_updates": [],
            "patient_mood": "neutral",
            "urgency": "low"
        }
