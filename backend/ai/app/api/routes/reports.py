from fastapi import APIRouter
from app.modules.weekly_report.report_builder import ReportBuilder

router = APIRouter()
builder = ReportBuilder()

@router.get("/reports/weekly/{patient_id}")
async def get_weekly_report(patient_id: str):
    """
    Builds the AI weekly report from Supabase DB logs.
    """
    report_json = builder.build(patient_id)
    return {
        "status": "success",
        "report": report_json
    }
