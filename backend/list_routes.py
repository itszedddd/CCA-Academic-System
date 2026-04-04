import sys
import os

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def list_routes():
    print("Registered Routes:")
    for route in app.routes:
        methods = getattr(route, "methods", "MOUNT")
        path = getattr(route, "path", "N/A")
        name = getattr(route, "name", "N/A")
        print(f"[{methods}] {path} (Name: {name})")

if __name__ == "__main__":
    list_routes()
