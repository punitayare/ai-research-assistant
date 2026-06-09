from app.services.storage import upload_pdf_to_supabase

with open("uploads/test.pdf", "rb") as f:
    file_bytes = f.read()

url = upload_pdf_to_supabase(
    file_bytes,
    "test.pdf"
)

print(url)