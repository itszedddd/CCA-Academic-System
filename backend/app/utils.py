try:
    import pytesseract
    from PIL import Image
    import io

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
