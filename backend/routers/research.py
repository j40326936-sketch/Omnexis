from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
import sqlite3, json, uuid, asyncio, os
from database import get_db
from routers.auth import verify_token
from agents.pipeline import run_research_pipeline
import tempfile

router = APIRouter()

class ResearchRequest(BaseModel):
    query: str

# In-memory progress store for SSE
_progress_store: dict[str, dict] = {}

async def run_pipeline_task(session_id: str, query: str):
    """Background task for running pipeline (non-SSE mode)."""
    conn = sqlite3.connect(os.getenv("DB_PATH", "omnexis-research-agent.db"))
    conn.row_factory = sqlite3.Row
    try:
        await run_research_pipeline(session_id, query, conn)
    except Exception as e:
        print(f"Pipeline error: {e}")
    finally:
        conn.close()

@router.post("/start")
async def start_research(
    req: ResearchRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    session_id = str(uuid.uuid4())
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO research_sessions (id, user_id, query, status) VALUES (?, ?, ?, 'running')",
        (session_id, current_user["user_id"], req.query),
    )
    db.commit()

    _progress_store[session_id] = {"stage": "planning", "progress": 0, "agent": "", "status": "starting"}
    background_tasks.add_task(run_pipeline_task, session_id, req.query)

    return {"session_id": session_id, "status": "started"}

@router.get("/progress/{session_id}")
async def stream_progress(
    session_id: str,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    """SSE endpoint for real-time progress updates."""
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM research_sessions WHERE id = ? AND user_id = ?",
        (session_id, current_user["user_id"]),
    )
    session = cursor.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        last_progress = -1
        timeout = 0
        while timeout < 300:  # 5 min max
            await asyncio.sleep(2)
            cursor = db.cursor()
            cursor.execute(
                "SELECT status, progress, current_stage FROM research_sessions WHERE id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            if not row:
                break

            if row["progress"] != last_progress:
                last_progress = row["progress"]
                timeout = 0
                data = json.dumps({
                    "progress": row["progress"],
                    "stage": row["current_stage"],
                    "status": row["status"]
                })
                yield f"data: {data}\n\n"

            if row["status"] in ("completed", "failed"):
                yield f"data: {json.dumps({'done': True, 'status': row['status']})}\n\n"
                break
            timeout += 2

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/status/{session_id}")
async def get_status(
    session_id: str,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT status, progress, current_stage, query, created_at FROM research_sessions WHERE id = ? AND user_id = ?",
        (session_id, current_user["user_id"]),
    )
    session = cursor.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get agent logs
    cursor.execute(
        "SELECT agent_name, status, started_at, completed_at FROM agent_logs WHERE session_id = ? ORDER BY id",
        (session_id,)
    )
    agents = [dict(a) for a in cursor.fetchall()]

    return {**dict(session), "agents": agents}

@router.get("/report/{session_id}")
async def get_report(
    session_id: str,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT user_id FROM research_sessions WHERE id = ?",
        (session_id,)
    )
    session = cursor.fetchone()
    if not session or session["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Report not found")

    cursor.execute(
        "SELECT * FROM research_reports WHERE session_id = ?",
        (session_id,)
    )
    report = cursor.fetchone()
    if not report:
        raise HTTPException(status_code=404, detail="Report not ready yet")

    cursor.execute("SELECT query, created_at, completed_at FROM research_sessions WHERE id = ?", (session_id,))
    meta = cursor.fetchone()

    return {
        "session_id": session_id,
        "query": meta["query"],
        "created_at": meta["created_at"],
        "completed_at": meta["completed_at"],
        "executive_summary": report["executive_summary"],
        "key_findings": json.loads(report["key_findings"] or "[]"),
        "detailed_analysis": json.loads(report["detailed_analysis"] or "{}"),
        "limitations": json.loads(report["limitations"] or "[]"),
        "references": json.loads(report["references"] or "[]"),
        "confidence_score": report["confidence_score"],
    }

@router.get("/report/{session_id}/pdf")
async def download_report_pdf(
    session_id: str,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    """Generate and return PDF report."""
    cursor = db.cursor()
    cursor.execute(
        "SELECT user_id, query FROM research_sessions WHERE id = ?", (session_id,)
    )
    session = cursor.fetchone()
    if not session or session["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Not found")

    cursor.execute("SELECT * FROM research_reports WHERE session_id = ?", (session_id,))
    report = cursor.fetchone()
    if not report:
        raise HTTPException(status_code=404, detail="Report not ready")

    # Generate simple text-based PDF using fpdf2
    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 20)
        pdf.cell(0, 12, "Omnexis Research Agent - Research Report", ln=True, align="C")
        pdf.set_font("Helvetica", size=11)
        pdf.cell(0, 8, f"Query: {session['query'][:80]}", ln=True)
        pdf.cell(0, 8, f"Confidence Score: {report['confidence_score']*100:.1f}%", ln=True)
        pdf.ln(5)

        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Executive Summary", ln=True)
        pdf.set_font("Helvetica", size=10)
        summary = report["executive_summary"] or ""
        pdf.multi_cell(0, 6, summary[:1000])
        pdf.ln(4)

        key_findings = json.loads(report["key_findings"] or "[]")
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Key Findings", ln=True)
        pdf.set_font("Helvetica", size=10)
        for i, f in enumerate(key_findings[:8], 1):
            pdf.multi_cell(0, 6, f"  {i}. {str(f)[:200]}")

        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Limitations", ln=True)
        pdf.set_font("Helvetica", size=10)
        limitations = json.loads(report["limitations"] or "[]")
        for lim in limitations[:5]:
            pdf.multi_cell(0, 6, f"  - {str(lim)[:200]}")

        tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        pdf.output(tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename=f"omnexis-research-agent-report-{session_id[:8]}.pdf")
    except ImportError:
        # Fallback: return JSON as text file
        content = json.dumps({
            "query": session["query"],
            "executive_summary": report["executive_summary"],
            "key_findings": json.loads(report["key_findings"] or "[]"),
        }, indent=2)
        tmp = tempfile.NamedTemporaryFile(suffix=".txt", delete=False, mode="w")
        tmp.write(content)
        tmp.close()
        return FileResponse(tmp.name, media_type="text/plain", filename="report.txt")
