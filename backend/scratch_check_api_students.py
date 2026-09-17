import requests
API_URL = 'https://cca-academic-system.onrender.com/api'
res = requests.post(f'{API_URL}/auth/login', data={'username': 'registrar', 'password': 'registrar123'})
if res.ok:
    token = res.json()['access_token']
    res2 = requests.get(f'{API_URL}/students/', headers={'Authorization': f'Bearer {token}'})
    students = res2.json()
    print(f'Total students: {len(students)}')
    names = [s.get('first_name') for s in students]
    if 'Kentaro' in names:
        print('Kentaro is found in API response!')
    else:
        print('Kentaro NOT found in API response.')
        print('First few students:', names[:5])
else:
    print('Login Failed')
