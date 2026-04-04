import xml.etree.ElementTree as ET
import re

def extract_text(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    texts = []
    for p in root.findall('.//w:p', ns):
        p_text = ""
        for t in p.findall('.//w:t', ns):
            if t.text: p_text += t.text
        if p_text: texts.append(p_text)
    return "\n".join(texts)

content = extract_text(r'c:\Users\ender\Programming\Thesis_Project\thesis_contents\word\document.xml')

# Find sections
def get_section(keyword, next_keyword=None):
    start = content.find(keyword)
    if start == -1: return f"{keyword} not found"
    if next_keyword:
        end = content.find(next_keyword, start)
        if end != -1: return content[start:end]
    return content[start:start+2000]

hw = get_section("Hardware Requirements", "Software Requirements")
sw = get_section("Software Requirements", "PROCESS")
sdlc = get_section("PROCESS (AGILE MODEL)", "Chapter")
timetable = get_section("Timetable", "References")
if "Timetable" not in timetable: # Fallback search
    timetable = get_section("Gantt", "References")

with open(r'c:\Users\ender\Programming\Thesis_Project\detailed_info.txt', 'w', encoding='utf-8') as f:
    f.write("=== HARDWARE ===\n" + hw + "\n\n")
    f.write("=== SOFTWARE ===\n" + sw + "\n\n")
    f.write("=== SDLC ===\n" + sdlc + "\n\n")
    f.write("=== TIMETABLE ===\n" + timetable + "\n\n")

print("Detailed extraction complete.")
