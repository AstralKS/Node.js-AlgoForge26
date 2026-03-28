import os, requests, sys

sys.stdout.reconfigure(encoding='utf-8')

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

print("=" * 50)
print("  MediAI - Supabase Re-Verification")
print("=" * 50)

tables = ["symptoms_log", "doctor_alerts", "transcription_logs", "weekly_reports"]
all_ok = True

for table in tables:
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1", headers=headers)
        if r.status_code == 200:
            print(f"  [OK] '{table}' exists")
        else:
            print(f"  [FAIL] '{table}' - status {r.status_code}")
            all_ok = False
    except Exception as e:
        print(f"  [ERROR] '{table}' - {e}")
        all_ok = False

print()
if all_ok:
    print("All 4 tables verified! Supabase is fully ready.")
else:
    print("Some tables are still missing. Please check Supabase SQL Editor.")
