try:
    import pytesseract
    from PIL import Image
    import io
    import shutil

    # Auto-detect Tesseract path on Windows
    if not shutil.which("tesseract"):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    def extract_text_from_image(file_bytes: bytes) -> str:
        try:
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            return f"ERROR: OCR failed — {str(e)}"

except ImportError:
    def extract_text_from_image(file_bytes: bytes) -> str:
        return "OCR libraries (pytesseract/Pillow) not installed."
