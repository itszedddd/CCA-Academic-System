from docx import Document
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

doc_path = r'C:\Users\ender\Downloads\[CCA] Manuscript_v2.docx'
d = Document(doc_path)

output = []
for i, p in enumerate(d.paragraphs):
    if p.text.strip():
        output.append(f"[{i}] {p.text}")

with open('manuscript_text.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print(f"Extracted {len(output)} paragraphs to manuscript_text.txt")
