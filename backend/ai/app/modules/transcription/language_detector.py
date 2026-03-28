class LanguageDetector:
    def detect(self, whisper_output: dict) -> str:
        """
        Extracts the language code from the whisper output.
        
        Args:
            whisper_output (dict): The output from WhisperHandler.transcribe_audio.
            
        Returns:
            str: The language code (e.g., 'hi', 'en', 'mr').
        """
        # faster-whisper info.language returns the language code like 'en', 'hi', 'mr'
        return whisper_output.get("language", "en")
