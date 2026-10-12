# app/routers/checkpoint.py
import json
import pathlib

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/checkpoint", tags=["checkpoint"])

DATA_DIR = pathlib.Path(__file__).resolve().parents[2] / "data"
FILE = DATA_DIR / "autosave.json"


@router.get("/")
async def load_checkpoint():
    if not FILE.exists():
        raise HTTPException(status_code=404, detail="no checkpoint")
    try:
        return json.loads(FILE.read_text(encoding="utf-8"))
    except Exception:
        raise HTTPException(status_code=500, detail="corrupt checkpoint")


@router.put("/")
async def save_checkpoint(payload: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    FILE.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    return {"ok": True, "bytes": FILE.stat().st_size}