from app.utils.llm_client import OpenRouterClient

class ReportTranslator:
    def __init__(self):
        self.llm = OpenRouterClient()
        
    def translate_transcript(self, transcript: str) -> dict:
        system_prompt = """
        You are an expert AI medical assistant. A patient and doctor just had a visit, and we have the raw transcript.
        Your job is to read the transcript and generate a patient-friendly summary report.
        Translate complex medical jargons into simple words.
        Extract exactly what the doctor's recommendations were.
        
        JSON OUTLINE:
        {
          "simplified_summary": "A fully simplified summary...",
          "doctor_recommendations": ["take medicine X", "rest for Y"],
          "jargon_dictionary": {
             "complex_word_used": "simple explanation"
          }
        }
        """
        
        user_prompt = f"Here is the transcript of the audio recording:\n\n{transcript}\n\nAnalyze and format it exactly to the JSON requirements."
        
        return self.llm.generate_json(system_prompt, user_prompt)
