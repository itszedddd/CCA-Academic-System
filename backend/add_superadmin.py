import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./cca.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_superadmin():
    db = SessionLocal()
    existing = db.query(User).filter(User.username == "superadmin").first()
    if not existing:
        superadmin = User(
            username="superadmin",
            hashed_password=get_password_hash("superadmin123"),
            role="Superadmin",
            is_active=1
        )
        db.add(superadmin)
        db.commit()
        print("Superadmin added!")
    else:
        print("Superadmin already exists.")
    db.close()

if __name__ == "__main__":
    add_superadmin()
