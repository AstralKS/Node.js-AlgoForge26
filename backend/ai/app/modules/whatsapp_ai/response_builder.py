class ResponseBuilder:
    def build(self, intent: str, extracted_data: dict) -> str:
        """
        Composes conversational WhatsApp responses based on intent and extracted data.
        Provides friendly, empathetic responses for the patient.
        """
        if intent == "urgent_alert":
            return (
                "⚠️ I have notified your doctor immediately regarding the severity of your condition. "
                "If this is a life-threatening emergency, please call 108 or visit the nearest hospital immediately. "
                "Your health is our top priority."
            )

        elif intent == "ask_doctor":
            return (
                "📋 I have forwarded your question securely to your doctor. "
                "They will review it and reply soon via this chat. "
                "In the meantime, if your condition worsens, please seek immediate medical help."
            )

        elif intent == "log_biometric":
            bio_parts = []
            biometrics = extracted_data.get("biometrics", {})
            if isinstance(biometrics, dict):
                for k, v in biometrics.items():
                    if v is not None:
                        bio_parts.append(f"{k.replace('_', ' ').title()}: {v}")

            if bio_parts:
                readings = ", ".join(bio_parts)
                return (
                    f"✅ Got it! I've logged your readings: {readings}. "
                    "Your doctor will review these during their next check. "
                    "Keep monitoring and stay healthy! 💪"
                )
            return "✅ Biometric data received and logged. Keep up the regular monitoring!"

        elif intent == "medication_update":
            meds = extracted_data.get("medication_updates", [])
            if meds:
                med_names = [m.get("name", "medication") for m in meds if isinstance(m, dict)]
                if med_names:
                    return (
                        f"💊 Medication update recorded: {', '.join(med_names)}. "
                        "Great job staying on track with your prescription! "
                        "Remember, consistency is key to your recovery."
                    )
            return "💊 Medication update noted. Keep following your prescribed schedule!"

        else:  # log_symptom or general
            symptoms = extracted_data.get("symptoms_found", [])
            if symptoms:
                if isinstance(symptoms[0], dict):
                    symptom_names = [s.get("name", str(s)) for s in symptoms]
                else:
                    symptom_names = [str(s) for s in symptoms]
                symptoms_str = ", ".join(symptom_names)
                return (
                    f"📝 Got it. I've successfully logged your symptoms ({symptoms_str}) "
                    "and our AI monitor is tracking your health patterns. "
                    "Your doctor will be notified if any concerning trends emerge. "
                    "Stay hydrated and rest well! 🙏"
                )
            return (
                "📝 Health log updated. Thank you for checking in! "
                "Make sure to stay hydrated and get adequate rest. "
                "Feel free to share any changes in your condition anytime."
            )
