from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
import traceback

SQLALCHEMY_DATABASE_URL = "sqlite:///./cca.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    print("Attempting to query User model via SQLAlchemy...")
    user = db.query(User).first()
    print(f"Success! Found user: {user.username if user else 'None'}")
except Exception as e:
    print("Failing to query User model!")
    traceback.print_exc()
finally:
    db.close()
