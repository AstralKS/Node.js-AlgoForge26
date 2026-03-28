from app.utils.llm_client import OpenRouterClient


class IntentClassifier:
    """AI-powered intent classification for WhatsApp messages."""

    def __init__(self):
        self.llm = OpenRouterClient()

    def classify(self, text: str) -> dict:
        """
        Classifies incoming WhatsApp text into intended application routes.
        Uses LLM for nuanced understanding, with keyword fallback.

        Returns:
            dict with 'intent' and 'confidence' fields
        """
        system_prompt = """
        You are a medical intent classifier for a healthcare WhatsApp bot.
        Classify the patient's message into one of these categories:

        - "log_symptom": Patient is reporting symptoms or health status
        - "log_biometric": Patient is sharing BP, glucose, temperature, etc.
        - "medication_update": Patient reporting medication taken/missed
        - "ask_doctor": Patient has a question for their doctor
        - "urgent_alert": Patient describes an emergency or severe condition
        - "general": General conversation or greeting

        Return JSON:
        {
          "intent": "log_symptom",
          "confidence": 0.9,
          "reasoning": "brief explanation"
        }
        """

        result = self.llm.generate_json(system_prompt, f"Patient message: {text}")

        if "error" in result:
            # Fallback to keyword-based classification
            return {"intent": self._keyword_classify(text), "confidence": 0.6, "reasoning": "keyword fallback"}

        return result

    def _keyword_classify(self, text: str) -> str:
        """Fallback keyword-based classification."""
        text_lower = text.lower()

        # High risk keywords
        if any(w in text_lower for w in ["emergency", "severe", "blood", "chest pain", "hospital", "cant breathe", "unconscious"]):
            return "urgent_alert"

        # Doctor questions
        if any(w in text_lower for w in ["doctor", "should i", "ask", "can i", "is it safe", "consult"]):
            return "ask_doctor"

        # Biometric data
        if any(w in text_lower for w in ["bp", "blood pressure", "sugar", "glucose", "temperature", "weight", "heart rate", "spo2"]):
            return "log_biometric"

        # Medication
        if any(w in text_lower for w in ["medicine", "took", "taken", "missed", "tablet", "dose", "pill"]):
            return "medication_update"

        return "log_symptom"
