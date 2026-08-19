import sqlite3
import sys

# We need to hash the password correctly, since we're using FastAPI passlib pbkdf2_sha256
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    hashed = pwd_context.hash("teacher123")
except ImportError:
    print("Could not import passlib.")
    sys.exit(1)

conn = sqlite3.connect("cca.db")
c = conn.cursor()
try:
    c.execute("INSERT INTO users (username, full_name, hashed_password, role, section, is_active) VALUES ('teacher', 'Default Teacher', ?, 'Teacher', 'Default', 1)", (hashed,))
    conn.commit()
    print("Teacher added successfully.")
except Exception as e:
    print(f"Error adding teacher: {e}")
finally:
    conn.close()
