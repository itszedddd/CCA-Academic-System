import re

with open(r'c:\Users\ender\Programming\Thesis_Project\backend\app\api\router.py', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'@aesms_router\.(get|post|put|delete|patch)\("([^"]+)"', content)
for method, path in matches:
    print(f"{method.upper():6s} {path}")
