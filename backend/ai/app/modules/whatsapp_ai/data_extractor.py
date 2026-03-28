class DataExtractor:
    def extract(self, text: str) -> dict:
        """
        Pulls symptom logs and biometrics straight out of WhatsApp free-text
        to feed seamlessly into the backend DB models (Symptom.ts & Biometric.ts).
        """
        # Very basic mock logic for demonstration purposes
        # In full scope, this would likely utilize spaCy or LLM entity extraction
        
        symptoms_found = []
        if "fever" in text.lower() or "बुखार" in text.lower():
            symptoms_found.append("fever")
        if "cough" in text.lower() or "खांसी" in text.lower():
            symptoms_found.append("cough")
            
        # Return properly structured map fitting the TS backend models
        return {
            "symptoms_found": symptoms_found,
            "biometrics": {
                "temperature": None,
                "blood_pressure": None
            }
        }
