import zipfile
import xml.etree.ElementTree as ET
import os

def extract_tables(docx_path):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    try:
        with zipfile.ZipFile(docx_path, 'r') as doc:
            xml_content = doc.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            tables = root.findall('.//w:tbl', ns)
            print(f"DEBUG: Found {len(tables)} tables in {docx_path}")
            
            for i, tbl in enumerate(tables):
                print(f"\n--- Table {i+1} ---")
                rows = tbl.findall('.//w:tr', ns)
                for row in rows:
                    cells = row.findall('.//w:tc', ns)
                    row_data = []
                    for cell in cells:
                        texts = []
                        # Look for all text elements within the cell
                        for t in cell.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                            if t.text:
                                texts.append(t.text)
                        row_data.append("".join(texts).strip())
                    print(" | ".join(row_data))
    except Exception as e:
        print(f"Error processing {docx_path}: {e}")

paths = [
    r'C:\Users\ender\Downloads\[HOP] Thesis Paper_00 (3).docx',
    r'c:\Users\ender\Programming\Thesis_Project\HOP_Thesis.docx'
]

for p in paths:
    if os.path.exists(p):
        print(f"\nProcessing: {p}")
        extract_tables(p)
    else:
        print(f"Path does not exist: {p}")
