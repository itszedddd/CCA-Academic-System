import requests
API_URL = 'https://cca-academic-system.onrender.com/api'

# Login as admission
res = requests.post(f'{API_URL}/auth/login', data={'username': 'admission', 'password': 'admission123'})
if not res.ok:
    print('Login Failed:', res.text)
    exit()

token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Check /auth/me
me = requests.get(f'{API_URL}/auth/me', headers=headers).json()
print('Logged in as:', me['username'], '| Role:', me['role'])

# Check enrollment forms
res2 = requests.get(f'{API_URL}/enrollment_forms/', headers=headers)
if res2.ok:
    forms = res2.json()
    print(f'Total enrollment forms: {len(forms)}')
    for f in forms[:5]:
        print(f'  Form #{f.get("id")}: student_id={f.get("student_id")} status={f.get("status")} type={f.get("form_type")}')
else:
    print('Failed to fetch forms:', res2.status_code, res2.text[:200])
