from app.services.supabase_client import supabase


def upload_pdf_to_supabase(
    file_bytes,
    filename
):

    supabase.storage.from_(
        "research-pdfs"
    ).upload(
        filename,
        file_bytes,
        {
            "content-type":
            "application/pdf"
        }
    )

    return (
        supabase.storage
        .from_("research-pdfs")
        .get_public_url(filename)
    )


def delete_pdf_from_supabase(
    filename
):

    supabase.storage.from_(
        "research-pdfs"
    ).remove(
        [filename]
    )