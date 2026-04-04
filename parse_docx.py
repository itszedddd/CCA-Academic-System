import xml.etree.ElementTree as ET
import zipfile
import sys

def extract_text_from_docx(docx_path, out_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text = []
            for paragraph in tree.findall('.//w:p', ns):
                para_text = ""
                for run in paragraph.findall('.//w:r', ns):
                    for t in run.findall('.//w:t', ns):
                        if t.text:
                            para_text += t.text
                if para_text:
                    text.append(para_text)
            
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(text))
            return "Success"
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    print(extract_text_from_docx(sys.argv[1], sys.argv[2]))
