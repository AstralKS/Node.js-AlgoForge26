import re

class ConversationParser:
    def __init__(self):
        # A simple keyword-based symptom dictionary (can be expanded)
        self.known_symptoms = [
            "fever", "headache", "cough", "cold", "pain", "nausea",
            "बुखार", "सिरदर्द", "खांसी", "जुकाम", "दर्द", "उल्टी",
            "ताप", "डोकेदुखी", "खोकला", "सर्दी"  # Adding some Marathi keywords
        ]
        
        self.medicine_keywords = [
            "medicine", "take", "pill", "tablet", "syrup",
            "दवा", "खानी", "गोली", "पीना",
            "औषध", "गोळी", "घ्या"
        ]

    def parse(self, text: str) -> dict:
        """
        Parses the text to extract symptoms, duration, and doctor instructions.
        Uses keyword-based logic without external APIs.
        
        Args:
            text (str): The cleaned conversation text.
            
        Returns:
            dict: Structured data containing symptoms, duration, and doctor_instructions.
        """
        text_lower = text.lower()
        
        # 1. Extract symptoms
        found_symptoms = []
        for symptom in self.known_symptoms:
            if symptom in text_lower:
                found_symptoms.append(symptom)
                
        # 2. Extract duration (e.g., "2 days", "3 दिन")
        duration = ""
        # Match patterns like: "2 days", "3 दिन", "4 divas"
        duration_match = re.search(r'(\d+)\s*(days|day|दिन|दिवस)', text_lower)
        if duration_match:
            duration = duration_match.group(0)
            
        # 3. Extract doctor instructions (medicine, dosage)
        # We split the text into sentences and check for instruction keywords
        instructions = []
        sentences = re.split(r'[.|।!?-]', text)
        for sentence in sentences:
            s_lower = sentence.lower()
            # If any medicine keyword is in the sentence, treat it as an instruction
            if any(kw in s_lower for kw in self.medicine_keywords):
                cleaned_sentence = sentence.strip()
                if cleaned_sentence:
                    instructions.append(cleaned_sentence)
                    
        return {
            "symptoms": list(set(found_symptoms)),  # Removing duplicates
            "duration": duration,
            "doctor_instructions": instructions
        }
