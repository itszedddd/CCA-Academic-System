import requests
import re

js_link = 'https://ccaedusys.site/assets/index-BcyYL-3v.js'
js_content = requests.get(js_link).text

for match in re.finditer(r'.{0,50}Dashboard.{0,50}', js_content):
    print(match.group(0))
