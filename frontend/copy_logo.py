import shutil

src = r"C:\Users\ender\Downloads\[CCA] Login page logo.png"
dst = r"C:\Users\ender\Programming\Thesis_Project\frontend\public\login-logo.png"

try:
    shutil.copyfile(src, dst)
    print("Logo copied successfully!")
except Exception as e:
    print("Error:", e)
