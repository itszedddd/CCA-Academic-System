import requests
API_URL = 'https://cca-academic-system.onrender.com/api'
res = requests.post(f'{API_URL}/auth/login', data={'username': 'registrar', 'password': 'registrar123'})
if res.ok:
    token = res.json()['access_token']
    res2 = requests.get(f'{API_URL}/auth/me', headers={'Authorization': f'Bearer {token}'})
    print('Registrar Me:', res2.json())
else:
    print('Failed', res.text)
