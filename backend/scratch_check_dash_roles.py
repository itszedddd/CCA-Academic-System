import requests
import re

js_link = 'https://ccaedusys.site/assets/index-BcyYL-3v.js'
js_content = requests.get(js_link).text

match = re.search(r'name:"Dashboard"[^}]*roles:\[(.*?)\]', js_content)
if match:
    print('Dashboard roles:', match.group(1))
else:
    print('Dashboard not found')
