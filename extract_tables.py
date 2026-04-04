import zipfile
import xml.etree.ElementTree as ET
import os

def extract_tables_from_docx(docx_path, output_txt):
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return

    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            
        root = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        output = []
        
        # Find all tables
        tables = root.findall('.//w:tbl', ns)
        for i, tbl in enumerate(tables):
            output.append(f"\n--- TABLE {i+1} ---")
            rows = tbl.findall('.//w:tr', ns)
            for row in rows:
                cells = row.findall('.//w:tc', ns)
                cell_texts = []
                for cell in cells:
                    cell_text = ""
                    # A cell contains multiple paragraphs
                    paragraphs = cell.findall('.//w:p', ns)
                    for p in paragraphs:
                        # A paragraph contains multiple text runs
                        texts = p.findall('.//w:t', ns)
                        for t in texts:
                            if t.text:
                                cell_text += t.text
                        cell_text += " " # Space between paragraphs in the same cell
                    cell_texts.append(cell_text.strip())
                output.append(" | ".join(cell_texts))
        
        full_output = "\n".join(output)
        
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write(full_output)
            
        print(f"Extraction successful. Tables saved to {output_txt}")
        
    except Exception as e:
        print(f"Error: {e}")

# Use the path provided by the user
docx_path = r'C:\Users\ender\Downloads\[HOP] Thesis Paper_00 (3).docx'
output_path = r'c:\Users\ender\Programming\Thesis_Project\hop_thesis_tables.txt'

extract_tables_from_docx(docx_path, output_path)
