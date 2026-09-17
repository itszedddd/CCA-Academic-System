import requests
import re

r = requests.get('https://ccaedusys.site/')
html = r.text
js_url = re.search(r'src="(/assets/index-.*?\.js)"', html)

if js_url:
    js_link = 'https://ccaedusys.site' + js_url.group(1)
    print('JS URL:', js_link)
    js_content = requests.get(js_link).text
    
    print('Found App.jsx /auth/me call?', '/auth/me' in js_content)
    # find where it sets the role
    match = re.search(r'set([a-zA-Z]+Role)\(([^\)]+)\)', js_content)
    if match:
        print('Role setter:', match.group(0))
        
    print('Role Admission exists?', 'Admission' in js_content)
    print('Role Registrar exists?', 'Registrar' in js_content)
else:
    print('Could not find JS file')
