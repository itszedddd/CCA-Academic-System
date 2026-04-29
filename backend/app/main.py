from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .database import engine, Base, SessionLocal
from .api.router import aesms_router
from . import models

Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)

# Auto-seed if database is empty (first deploy)
def _auto_seed():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            print("[CCA] Empty database detected — running seed...")
            db.close()
            from seed_cca import seed_data
            seed_data()
            print("[CCA] Seed complete.")
        else:
            db.close()
    except Exception as e:
        print(f"[CCA] Auto-seed skipped or failed: {e}")
        db.close()

_auto_seed()

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

app = FastAPI(
    title="CCA System API",
    description=(
        "Calvary Christian Academy System — "
        "Integrates ML-powered predictive tuition risk analytics, automated OCR enrollment, "
        "and academic tracking."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aesms_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Serve frontend assets and static files
if os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="frontend-assets")

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "CCA", "version": "1.0.1-debug-seed"}

# Catch-all: serve index.html for any non-API route (SPA support)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # If a specific file exists in dist, serve it
    file_path = os.path.join(FRONTEND_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Otherwise serve index.html for SPA routing
    index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"system": "CCA", "institution": "Calvary Christian Academy", "message": "CCA System API is running."}

