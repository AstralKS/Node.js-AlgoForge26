class IntentClassifier:
    def classify(self, text: str) -> str:
        """
        AI Brain for WhatsApp messages: Classifies unstructured incoming text 
        into intended application routes.
        
        Outputs either: log_symptom | ask_doctor | urgent_alert
        """
        text_lower = text.lower()
        
        # High Risk Keywords
        if any(w in text_lower for w in ["emergency", "severe", "blood", "pain", "hospital", "chest"]):
            return "urgent_alert"
            
        # Needs practitioner review
        if any(w in text_lower for w in ["doctor", "should i", "ask", "can i", "is it safe"]):
            return "ask_doctor"
            
        # Routine checkin logs
        return "log_symptom"
