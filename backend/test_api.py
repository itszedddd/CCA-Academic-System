import urllib.request
import json
import time

url = 'https://cca-academic-system.onrender.com/api/debug/seed'
print(f"Testing {url}...")
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("RESULT:", response.read().decode())
except Exception as e:
    print("ERROR:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
