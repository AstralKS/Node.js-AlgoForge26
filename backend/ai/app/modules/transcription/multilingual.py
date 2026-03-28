import re

class MultilingualProcessor:
    def process(self, text: str, language: str) -> str:
        """
        Cleans extra spaces and normalizes basic Hindi errors.
        Handles mixed Hindi-English text normalization.
        
        Args:
            text (str): The raw transcribed text.
            language (str): The language code (e.g., 'hi', 'en', 'mr').
            
        Returns:
            str: The cleaned and normalized text.
        """
        # 1. Clean extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # 2. Normalize basic Hindi errors if Hindi is detected
        if language == 'hi':
            # Basic normalizations (e.g., "मुजे" -> "मुझे")
            replacements = {
                "मुजे": "मुझे",
                "बीमारि": "बीमारी",
                "डॉक्टर": "डॉक्टर",  # (Example placeholder if there was a typo variation)
                "दवाईया": "दवाइयां"
            }
            
            for wrong, correct in replacements.items():
                text = text.replace(wrong, correct)
                
        # More conditional normalization logic for other languages can be added here
        
        return text
