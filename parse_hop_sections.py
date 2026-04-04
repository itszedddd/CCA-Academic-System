import re

def extract_sections(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for lines around Hardware and Software Requirements
    hw_match = re.search(r'Hardware Requirements(.*?)(?=\n\n|\n[A-Z][a-z]+ Requirements|$)', content, re.DOTALL | re.IGNORECASE)
    sw_match = re.search(r'Software Requirements(.*?)(?=\n\n|\n[A-Z][a-z]+ Requirements|$)', content, re.DOTALL | re.IGNORECASE)

    hw_text = hw_match.group(1).strip() if hw_match else "Hardware Requirements not found"
    sw_text = sw_match.group(1).strip() if sw_match else "Software Requirements not found"

    print("=== HARDWARE REQUIREMENTS ===")
    print(hw_text)
    print("\n=== SOFTWARE REQUIREMENTS ===")
    print(sw_text)

    # Also look for versions
    print("\nSearching for versions...")
    versions = re.findall(r'.{0,50}(v\d+\.\d+|\d+\.\d+\.\d+|version \d+).{0,50}', content, re.IGNORECASE)
    for v in versions:
        print(v)

extract_sections(r'c:\Users\ender\Programming\Thesis_Project\hop_thesis_text.txt')
