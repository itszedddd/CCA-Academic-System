import requests
import re

js_link = 'https://ccaedusys.site/assets/index-BcyYL-3v.js'
js_content = requests.get(js_link).text

match = re.search(r'fetch\([^\)]*auth/me[^\)]*\).*?then\([^\{]*\{([^}]*)\}', js_content)
if match:
    print('Found auth/me handler (partial):', match.group(0)[:500])
    
# Let's just find "fetchProfile" or similar
for match in re.finditer(r'.{0,50}auth/me.{0,150}', js_content):
    print(match.group(0))
