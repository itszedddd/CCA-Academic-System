import requests
API_URL = 'https://cca-academic-system.onrender.com/api'

# Try logging in with registrar (we know the password is registrar123)
res = requests.post(f'{API_URL}/auth/login', data={'username': 'registrar', 'password': 'registrar123'})
if not res.ok:
    print('Registrar login Failed:', res.text)
    exit()

token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Check enrollment forms - registrar should have access
res2 = requests.get(f'{API_URL}/enrollment_forms/', headers=headers)
if res2.ok:
    forms = res2.json()
    print(f'Total enrollment forms from API: {len(forms)}')
    for f in forms[:5]:
        print(f'  Form #{f.get("id")}: student_id={f.get("student_id")} status={f.get("status")} type={f.get("form_type")}')
else:
    print('Failed to fetch forms:', res2.status_code, res2.text[:200])

# Check students
res3 = requests.get(f'{API_URL}/students/', headers=headers)
if res3.ok:
    students = res3.json()
    print(f'\nTotal students from API: {len(students)}')
    names = [(s.get('first_name'), s.get('last_name')) for s in students[:5]]
    print('First 5:', names)
    kentaro = [s for s in students if 'Kentaro' in (s.get('first_name') or '')]
    print('Kentaro found?', len(kentaro) > 0)
else:
    print('Failed to fetch students:', res3.status_code)
