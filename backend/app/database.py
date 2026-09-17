import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use DATABASE_URL env var in production (PostgreSQL).
# Falls back to Render PostgreSQL DB so the live site works without manual config.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://cca_db_l21e_user:B2g65PhdGG7DmRgSN3DQOgHTkTITGpcj@dpg-dalmcp942hec73cvublg-a.singapore-postgres.render.com/cca_db_l21e")

# Render/Railway provide URLs starting with 'postgres://' but SQLAlchemy
# requires 'postgresql://'.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

_is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **({"connect_args": {"check_same_thread": False}} if _is_sqlite else {})
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
