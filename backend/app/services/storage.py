from app.services.supabase_client import supabase
import uuid


def upload_pdf_to_supabase(file_bytes, filename):

    safe_filename = f"{uuid.uuid4()}_{filename}"

    supabase.storage.from_("research-pdfs").upload(
        safe_filename,
        file_bytes,
        file_options={
            "content-type": "application/pdf",
            "upsert": True
        }
    )

    public_url = supabase.storage.from_("research-pdfs").get_public_url(
        safe_filename
    )

    return {
        "filename": safe_filename,
        "file_url": public_url
    }


def delete_pdf_from_supabase(filename):

    supabase.storage.from_("research-pdfs").remove([filename])