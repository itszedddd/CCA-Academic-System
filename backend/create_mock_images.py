import os
from PIL import Image, ImageDraw, ImageFont

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

mock_files = [
    "mock_form.jpg",
    "mock_form_juan.jpg", 
    "mock_bc_maria.jpg",
    "mock_form_emilio.jpg",
    "mock_f138_andres.jpg",
    "mock_gm_apolinario.jpg"
]

for filename in mock_files:
    file_path = os.path.join("uploads", filename)
    if not os.path.exists(file_path):
        # Create a simple colored image with text
        img = Image.new('RGB', (800, 1000), color=(240, 240, 240))
        d = ImageDraw.Draw(img)
        d.text((50, 50), f"MOCK DOCUMENT: {filename}", fill=(0, 0, 0))
        d.rectangle([50, 100, 750, 950], outline=(0, 0, 0), width=2)
        d.text((100, 200), "This is a placeholder for OCR visual testing.", fill=(50, 50, 50))
        img.save(file_path)
        print(f"Created {file_path}")
