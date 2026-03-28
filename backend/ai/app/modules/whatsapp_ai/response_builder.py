class ResponseBuilder:
    def build(self, intent: str, extracted_data: dict) -> str:
        """
        Composes conversational WhatsApp responses based on extracted JSON content.
        This provides the final payload sent down to the whatsapp-service (Shruti's area).
        """
        if intent == "urgent_alert":
            return "⚠️ I have notified your doctor immediately regarding the severity. If this is a life-threatening emergency, please visit the nearest hospital or call SOS."
        
        elif intent == "ask_doctor":
            return "I have forwarded your question securely to your doctor. They will review it and reply soon via this chat."
        
        else:
            symptoms_str = ", ".join(extracted_data.get("symptoms_found", []))
            if symptoms_str:
                return f"Got it. I've successfully logged your symptoms ({symptoms_str}) and alerted the general wellness monitor."
            return "Health log updated. Make sure to stay hydrated!"
