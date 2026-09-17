import requests
import re

js_link = 'https://ccaedusys.site/assets/index-BcyYL-3v.js'
js_content = requests.get(js_link).text

# Find the string "REGISTRAR'S DASHBOARD"
if "REGISTRAR'S DASHBOARD" in js_content:
    print("Found REGISTRAR dashboard header")
else:
    print("NOT FOUND: REGISTRAR")
    
# Find the string "ADMISSION'S DASHBOARD"
if "ADMISSION'S DASHBOARD" in js_content:
    print("Found ADMISSION dashboard header")
else:
    print("NOT FOUND: ADMISSION")

# Find the string "STUDENT DASHBOARD"
if "STUDENT DASHBOARD" in js_content:
    print("Found STUDENT dashboard header")

