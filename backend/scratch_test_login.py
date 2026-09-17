import requests

API_URL = "https://cca-academic-system.onrender.com/api"

# Login
res = requests.post(f"{API_URL}/auth/login", data={"username": "admission", "password": "admission123"})
if not res.ok:
    print("Login failed:", res.text)
    exit(1)
    
token = res.json()["access_token"]
print("Token:", token)

# Get Me
res2 = requests.get(f"{API_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
print("Me:", res2.json())
