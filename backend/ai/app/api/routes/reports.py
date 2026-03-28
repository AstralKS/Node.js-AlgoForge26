from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.modules.weekly_report.report_builder import ReportBuilder
from app.modules.weekly_report.insight_generator import InsightGenerator
from app.modules.weekly_report.doctor_summary import DoctorSummary

router = APIRouter()
builder = ReportBuilder()
insight_gen = InsightGenerator()
doctor_summary = DoctorSummary()


class ReportRequest(BaseModel):
    patient_id: str


@router.get("/reports/weekly/{patient_id}")
async def get_weekly_report(patient_id: str):
    """
    Builds the AI weekly report from Supabase DB logs.
    Includes full LLM-generated report + local insight analysis + doctor summary.
    """
    # 1. Build LLM-powered weekly report
    report_json = builder.build(patient_id)

    # 2. Generate insights (local logic — persistent symptom detection)
    insights = insight_gen.generate(report_json)

    # 3. Generate doctor-readable summary
    summary_text = doctor_summary.generate(report_json, insights)

    return {
        "status": "success",
        "report": report_json,
        "insights": insights,
        "doctor_summary": summary_text
    }


@router.post("/reports/weekly/generate")
async def generate_weekly_report(payload: ReportRequest):
    """
    Same as GET but via POST for the Node.js backend to call.
    Generates and stores the report in Supabase.
    """
    report_json = builder.build(payload.patient_id)
    insights = insight_gen.generate(report_json)
    summary_text = doctor_summary.generate(report_json, insights)

    return {
        "status": "success",
        "report": report_json,
        "insights": insights,
        "doctor_summary": summary_text
    }
