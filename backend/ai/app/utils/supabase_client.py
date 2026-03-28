"""
Lightweight Supabase client using REST API (no heavy SDK needed).
Reads env from backend/.env automatically.
"""
import os
import requests

# Load .env from backend/ folder
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".env")
if os.path.exists(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# Support both key names — SUPABASE_SERVICE_ROLE_KEY for admin access,
# fallback to SUPABASE_ANON_KEY, then legacy SUPABASE_KEY
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_KEY", "")
)


class SupabaseREST:
    """Simple REST wrapper for Supabase PostgREST API."""

    def __init__(self):
        self.base_url = f"{SUPABASE_URL}/rest/v1"
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def insert(self, table: str, data: dict) -> dict:
        """Insert a row into a Supabase table."""
        try:
            r = requests.post(f"{self.base_url}/{table}", headers=self.headers, json=data)
            r.raise_for_status()
            result = r.json()
            return result[0] if isinstance(result, list) and len(result) > 0 else result
        except Exception as e:
            print(f"[Supabase INSERT error] {table}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"  Response: {e.response.text}")
            return {"error": str(e)}

    def select(self, table: str, filters: dict = None, limit: int = 50, order: str = None) -> list:
        """Select rows from a Supabase table with optional filters."""
        try:
            params = f"?select=*&limit={limit}"
            if filters:
                for k, v in filters.items():
                    params += f"&{k}=eq.{v}"
            if order:
                params += f"&order={order}"
            r = requests.get(f"{self.base_url}/{table}{params}", headers=self.headers)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"[Supabase SELECT error] {table}: {e}")
            return []

    def update(self, table: str, filters: dict, data: dict) -> dict:
        """Update rows in a Supabase table matching filters."""
        try:
            params = ""
            for k, v in filters.items():
                params += f"&{k}=eq.{v}"
            params = "?" + params.lstrip("&")
            r = requests.patch(
                f"{self.base_url}/{table}{params}",
                headers=self.headers,
                json=data
            )
            r.raise_for_status()
            result = r.json()
            return result[0] if isinstance(result, list) and len(result) > 0 else result
        except Exception as e:
            print(f"[Supabase UPDATE error] {table}: {e}")
            return {"error": str(e)}

    def delete(self, table: str, filters: dict) -> bool:
        """Delete rows matching filters."""
        try:
            params = ""
            for k, v in filters.items():
                params += f"&{k}=eq.{v}"
            params = "?" + params.lstrip("&")
            r = requests.delete(f"{self.base_url}/{table}{params}", headers=self.headers)
            r.raise_for_status()
            return True
        except Exception as e:
            print(f"[Supabase DELETE error] {table}: {e}")
            return False


def get_supabase() -> SupabaseREST:
    """Returns a lightweight Supabase REST client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: SUPABASE_URL or SUPABASE_KEY/SUPABASE_ANON_KEY missing.")
        return None
    return SupabaseREST()
