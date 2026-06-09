from fastapi import APIRouter, UploadFile, File
from app.db import cursor, conn
from supabase import create_client, Client
import os

router = APIRouter()

# =========================
# SUPABASE CONFIG
# =========================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "study-docs"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# =========================
# SAVE TO POSTGRES
# =========================
def save_study_document(filename: str, file_url: str):

    cursor.execute("""
        INSERT INTO study_documents (filename, file_url)
        VALUES (%s, %s)
        ON CONFLICT (filename) DO NOTHING
    """, (filename, file_url))

    conn.commit()


# =========================
# UPLOAD PDF (SUPABASE + POSTGRES)
# =========================
@router.post("/study-upload")
async def upload_study_pdf(file: UploadFile = File(...)):

    file_name = file.filename
    file_bytes = await file.read()

    # 1. Upload to Supabase Storage
    supabase.storage.from_(BUCKET_NAME).upload(
        file_name,
        file_bytes,
        {
            "content-type": file.content_type
        }
    )

    # 2. Get public URL
    file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)

    # 3. Save metadata in Render Postgres
    save_study_document(file_name, file_url)

    return {
        "filename": file_name,
        "file_url": file_url,
        "status": "uploaded"
    }


# =========================
# GET ALL PDFs
# =========================
@router.get("/study-uploaded-pdfs")
async def get_study_uploaded_pdfs():

    cursor.execute("""
        SELECT filename, file_url
        FROM study_documents
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    pdfs = [
        {
            "name": row[0],
            "url": row[1]
        }
        for row in rows
    ]

    return {"pdfs": pdfs}


# =========================
# DELETE PDF (SUPABASE + POSTGRES)
# =========================
@router.delete("/study-upload/{filename}")
async def delete_study_pdf(filename: str):

    try:
        # 1. Delete from Supabase Storage
        supabase.storage.from_(BUCKET_NAME).remove([filename])

        # 2. Delete from Postgres
        cursor.execute("""
            DELETE FROM study_documents
            WHERE filename = %s
        """, (filename,))

        conn.commit()

        return {
            "message": f"{filename} deleted successfully"
        }

    except Exception as e:
        return {"error": str(e)}