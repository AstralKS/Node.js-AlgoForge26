from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import transcription, whatsapp_dummy, reports, analysis, risk

app = FastAPI(
    title="MediAI AI Service",
    description="AI-powered medical analysis, transcription, and monitoring service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────
app.include_router(transcription.router, prefix="/api", tags=["Transcription"])
app.include_router(whatsapp_dummy.router, prefix="/api", tags=["WhatsApp AI"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(analysis.router, prefix="/api", tags=["Symptom Analysis"])
app.include_router(risk.router, prefix="/api", tags=["Risk Evaluation"])


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "mediai-ai-service",
        "version": "2.0.0",
        "endpoints": {
            "transcribe": "POST /api/transcribe",
            "analyze_symptoms": "POST /api/analyze/symptoms",
            "whatsapp_webhook": "POST /api/whatsapp/webhook",
            "whatsapp_process": "POST /api/whatsapp/process",
            "weekly_report": "GET /api/reports/weekly/{patient_id}",
            "risk_evaluate": "POST /api/risk/evaluate",
            "health": "GET /"
        }
    }


@app.get("/api/health")
def api_health():
    """Health check endpoint for the Node.js backend to verify connectivity."""
    return {"status": "ok", "service": "mediai-ai-service"}
