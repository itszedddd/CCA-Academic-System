import zipfile
import xml.etree.ElementTree as ET
import os

def extract_from_docx(docx_path, output_txt):
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return

    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            
        root = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        texts = []
        for p in root.findall('.//w:p', ns):
            p_text = ""
            for t in p.findall('.//w:t', ns):
                if t.text:
                    p_text += t.text
            if p_text:
                texts.append(p_text)
        
        full_text = "\n".join(texts)
        
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write(full_text)
            
        print(f"Extraction successful. Text saved to {output_txt}")
        
    except Exception as e:
        print(f"Error: {e}")

extract_from_docx(r'c:\Users\ender\Programming\Thesis_Project\HOP_Thesis.docx', r'c:\Users\ender\Programming\Thesis_Project\hop_thesis_text.txt')
