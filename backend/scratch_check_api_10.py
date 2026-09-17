import requests
API_URL = 'https://cca-academic-system.onrender.com/api'
res = requests.post(f'{API_URL}/auth/login', data={'username': 'superadmin', 'password': 'superadmin123'})
if res.ok:
    token = res.json()['access_token']
    res2 = requests.get(f'{API_URL}/students/?limit=10', headers={'Authorization': f'Bearer {token}'})
    students = res2.json()
    print('First 10 students:', [s.get('first_name') for s in students])
    print('Is Kentaro in the first 10?', any('Kentaro' in s.get('first_name', '') for s in students))
else:
    print('Login Failed')
