import xml.etree.ElementTree as ET
import re

def extract_text(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # Namespaces
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    texts = []
    for p in root.findall('.//w:p', ns):
        p_text = ""
        for t in p.findall('.//w:t', ns):
            if t.text:
                p_text += t.text
        if p_text:
            texts.append(p_text)
    
    return "\n".join(texts)

content = extract_text(r'c:\Users\ender\Programming\Thesis_Project\thesis_contents\word\document.xml')

# Search for keywords
keywords = ["SDLC", "Agile", "Waterfall", "Hardware Requirement", "Software Requirement", "Timetable", "Gantt", "Features"]
results = []
for kw in keywords:
    matches = re.findall(f".{{0,200}}{kw}.{{0,200}}", content, re.IGNORECASE)
    if matches:
        results.append(f"--- Matches for {kw} ---")
        results.extend(matches)
        results.append("\n")

with open(r'c:\Users\ender\Programming\Thesis_Project\extracted_info.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(results))
    f.write("\n\nFULL CONTENT SAMPLE:\n")
    f.write(content[:5000]) # First 5000 chars

print("Extraction complete. Check extracted_info.txt")
