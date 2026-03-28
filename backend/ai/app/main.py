from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import transcription, whatsapp_dummy, reports

app = FastAPI(title="MediAI Backend Logic (AI + API structure)", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription.router, prefix="/api", tags=["transcription"])
app.include_router(whatsapp_dummy.router, prefix="/api", tags=["whatsapp"])
app.include_router(reports.router, prefix="/api", tags=["reports"])

@app.get("/")
def health_check():
    return {
        "status": "Backend AI structure Running! Waiting for UI connections.",
        "config": "Supabase online, OpenRouter online."
    }
