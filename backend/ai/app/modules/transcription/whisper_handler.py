from faster_whisper import WhisperModel

class WhisperHandler:
    def __init__(self):
        """
        Initializes the WhisperModel using faster-whisper.
        Loads the model once as requested to optimize transcription.
        """
        # Load Whisper model once
        self.model = WhisperModel("small", device="cpu", compute_type="int8")

    def transcribe_audio(self, audio_path: str) -> dict:
        """
        Transcribes the given audio file using the pre-loaded Whisper model.
        
        Args:
            audio_path (str): The path to the audio file.
            
        Returns:
            dict: A dictionary containing the detected language code and full transcribed text.
        """
        # Transcribe audio with a standard beam size
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        # Combine all transcription segments into a single text
        text_segments = []
        for segment in segments:
            text_segments.append(segment.text)
            
        full_text = " ".join(text_segments).strip()
        
        return {
            "language": info.language,
            "text": full_text
        }
