import re

def extract_sections(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the section "CHAPTER 3" onwards or similar
    # House of Papi (HOP) usually has technical specs in Chapter 3
    
    # Let's search for "Hardware Requirements" and "Software Requirements" again with more context
    def get_context(keyword, num_chars=1500):
        pos = content.find(keyword)
        if pos == -1: return f"{keyword} not found"
        return content[pos:pos+num_chars]

    hw_text = get_context("Hardware Requirements")
    sw_text = get_context("Software Requirements")

    with open(r'c:\Users\ender\Programming\Thesis_Project\hop_ext_output.txt', 'w', encoding='utf-8') as f:
        f.write("=== HARDWARE ===\n")
        f.write(hw_text)
        f.write("\n\n=== SOFTWARE ===\n")
        f.write(sw_text)

extract_sections(r'c:\Users\ender\Programming\Thesis_Project\hop_thesis_text.txt')
