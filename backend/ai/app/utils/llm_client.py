import os
import random
import requests
import json

# Load .env from backend/ folder
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".env")
if os.path.exists(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()


class OpenRouterClient:
    """Rotating API keys + rotating models client for OpenRouter."""

    def __init__(self):
        self.keys = [
            os.getenv("OPENROUTER_API_KEY_1"),
            os.getenv("OPENROUTER_API_KEY_2")
        ]
        self.model = os.getenv("OPENROUTER_MODEL_2", "stepfun/step-3.5-flash:free")

    def _get_active_key(self):
        valid_keys = [k for k in self.keys if k]
        return random.choice(valid_keys) if valid_keys else None

    def _get_active_model(self):
        return self.model

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        """Calls OpenRouter and enforces JSON format response."""
        api_key = self._get_active_key()
        model = self._get_active_model()

        if not api_key:
            return {"error": "No OpenRouter API keys configured in .env"}

        print(f"  [LLM] Using model: {model}")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://mediai.hackathon.local",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt + "\n\nALWAYS RESPOND IN PURE JSON FORMAT ONLY."},
                {"role": "user", "content": user_prompt}
            ]
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers, json=payload, timeout=30
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]

            # Strip markdown wrapper if LLM hallucinated it
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()

            return json.loads(content)
        except Exception as e:
            print(f"  [LLM ERROR] {str(e)}")
            return {"error": "LLM call failed", "details": str(e)}
