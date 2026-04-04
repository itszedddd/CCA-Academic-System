from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .api.router import aesms_router
from . import models

Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)

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

@app.get("/")
def root():
    return {
        "system": "CCA",
        "institution": "Calvary Christian Academy",
        "message": "CCA System API is running.",
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "CCA"}
