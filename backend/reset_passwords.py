import os
import sys

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
users = db.query(User).all()
new_hash = get_password_hash("password123")
for user in users:
    user.hashed_password = new_hash
db.commit()
print(f"Updated passwords to 'password123' for {len(users)} users.")
db.close()
