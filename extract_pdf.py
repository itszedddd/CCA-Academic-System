import fitz

doc = fitz.open(r'C:\Users\ender\Downloads\[SYSTEM INSPECTION v1.0] CCA PORTAL.pdf')
output = []

for i, page in enumerate(doc):
    output.append(f'=== PAGE {i+1} ===')
    text = page.get_text('dict', sort=True)
    for block in text.get('blocks', []):
        btype = block.get('type')
        if btype == 0:
            for line in block.get('lines', []):
                spans = line.get('spans', [])
                line_text = ''.join(s.get('text','') for s in spans)
                if line_text.strip():
                    output.append(line_text)
        elif btype == 1:
            output.append('[IMAGE BLOCK]')
    output.append('')

doc.close()
result = '\n'.join(output)
with open('pdf_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print('Done. Written', len(result), 'chars.')
