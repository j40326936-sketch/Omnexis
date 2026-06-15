from fastapi import APIRouter, HTTPException, Depends
import sqlite3, json
from database import get_db
from routers.auth import verify_token

router = APIRouter()

@router.get("/")
async def get_history(
    search: str = "",
    limit: int = 20,
    offset: int = 0,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    if search:
        cursor.execute(
            """SELECT rs.id, rs.query, rs.status, rs.progress, rs.created_at, rs.completed_at,
                      rr.confidence_score
               FROM research_sessions rs
               LEFT JOIN research_reports rr ON rs.id = rr.session_id
               WHERE rs.user_id = ? AND rs.query LIKE ?
               ORDER BY rs.created_at DESC LIMIT ? OFFSET ?""",
            (current_user["user_id"], f"%{search}%", limit, offset),
        )
    else:
        cursor.execute(
            """SELECT rs.id, rs.query, rs.status, rs.progress, rs.created_at, rs.completed_at,
                      rr.confidence_score
               FROM research_sessions rs
               LEFT JOIN research_reports rr ON rs.id = rr.session_id
               WHERE rs.user_id = ?
               ORDER BY rs.created_at DESC LIMIT ? OFFSET ?""",
            (current_user["user_id"], limit, offset),
        )

    rows = cursor.fetchall()

    cursor.execute(
        "SELECT COUNT(*) as cnt FROM research_sessions WHERE user_id = ?",
        (current_user["user_id"],)
    )
    total = cursor.fetchone()["cnt"]

    return {"items": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    current_user=Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id FROM research_sessions WHERE id = ? AND user_id = ?",
        (session_id, current_user["user_id"]),
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Not found")

    cursor.execute("DELETE FROM research_reports WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM agent_logs WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM research_sessions WHERE id = ?", (session_id,))
    db.commit()
    return {"message": "Deleted successfully"}
