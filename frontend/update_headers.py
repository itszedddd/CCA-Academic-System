import re

file_path = r"C:\Users\ender\Programming\Thesis_Project\frontend\src\pages\PreRegistrationPage.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace F1 Header
f1_pattern = r'<div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">\s*<div className="flex items-center gap-4">\s*<img src="/assets/\[CCA L1\] CCA EduSys Logo V1\.png" alt="CCA Logo" className="h-20 w-auto" />\s*<div>\s*<h1 className="text-3xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>\s*<p className="text-sm italic m-0">"Train up a child in the way he should go\.\.\."</p>\s*</div>\s*</div>\s*<div className="text-right">\s*<div className="text-4xl font-bold border-2 border-black px-6 py-2">F1</div>\s*</div>\s*</div>'

f1_replacement = """<div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-20 w-auto mb-2" />
                  <h1 className="text-3xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>
                  <p className="text-sm italic m-0">"Train up a child in the way he should go..."</p>
                </div>"""

content = re.sub(f1_pattern, f1_replacement, content)


# Replace F2, F3, F4, F6 Headers
fn_pattern = r'<div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">\s*<div className="flex items-center gap-4">\s*<img src="/assets/\[CCA L1\] CCA EduSys Logo V1\.png" alt="CCA Logo" className="h-16 w-auto" />\s*<h1 className="text-2xl font-bold uppercase tracking-wider m-0">Calvary Christian Academy</h1>\s*</div>\s*<div className="text-3xl font-bold border-2 border-black px-6 py-2">F\d</div>\s*</div>'

fn_replacement = """<div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto mb-2" />
                  <h1 className="text-2xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>
                </div>"""

content = re.sub(fn_pattern, fn_replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Headers updated.")
