from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from pathlib import Path
import shutil

from app.rag.pdf_parser import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.embeddings import embedding_model
from app.rag.vector_store import save_document, store_chunks, collection

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def process_pdf(file_path: str, filename: str):
    try:
        print("\n========== PDF PROCESS STARTED ==========")

        text = extract_text_from_pdf(file_path)

        chunks = chunk_text(text=text, source=filename)

        enriched_chunks = embedding_model.generate_embeddings(chunks)

        store_chunks(enriched_chunks)

        print("\n========== PDF PROCESS COMPLETED ==========\n")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("ERROR:", str(e))


@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # IMPORTANT: convert Path → str
    file_path_str = str(file_path)

    # SAVE FIRST (metadata only)
   # save_document(file.filename, file_path_str)

    # PROCESS AFTER
    background_tasks.add_task(
        process_pdf,
        file_path_str,
        file.filename
    )

    return {
        "filename": file.filename,
        "file_url": f"/uploads/{file.filename}",
        "status": "processing_started"
    }


@router.get("/uploaded-pdfs")
async def get_uploaded_pdfs():
    pdfs = [
        {
            "name": file.name,
            "url": f"/uploads/{file.name}"
        }
        for file in UPLOAD_DIR.glob("*.pdf")
    ]

    return {"pdfs": pdfs}


@router.delete("/delete-pdf/{filename}")
async def delete_pdf(filename: str):

    try:
        file_path = UPLOAD_DIR / filename

        if file_path.exists():
            file_path.unlink()

        results = collection.get(where={"source": filename})
        ids = results.get("ids", [])

        if ids:
            collection.delete(ids=ids)

        return {"message": f"{filename} deleted successfully"}

    except Exception as e:
        return {"error": str(e)}
    























    from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil

from app.db import cursor, conn

router = APIRouter()

STUDY_DIR = Path("study_uploads")
STUDY_DIR.mkdir(exist_ok=True)


# =========================
# SAVE TO POSTGRES
# =========================
def save_study_document(filename: str, file_path: str):

    cursor.execute("""
        INSERT INTO study_documents (filename, file_path)
        VALUES (%s, %s)
        ON CONFLICT (filename) DO NOTHING
    """, (filename, file_path))

    conn.commit()


# =========================
# UPLOAD PDF
# =========================
@router.post("/study-upload")
async def upload_study_pdf(file: UploadFile = File(...)):

    file_path = STUDY_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_path_str = str(file_path)

    # SAVE TO POSTGRES
    save_study_document(file.filename, file_path_str)

    return {
        "filename": file.filename,
        "file_url": f"/study_uploads/{file.filename}",
        "status": "saved"
    }


# =========================
# GET ALL PDFs
# =========================
@router.get("/study-uploaded-pdfs")
async def get_study_uploaded_pdfs():

    cursor.execute("""
        SELECT filename, file_path
        FROM study_documents
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    pdfs = [
        {
            "name": row[0],
            "url": f"/study_uploads/{row[0]}",
            "path": row[1]
        }
        for row in rows
    ]

    return {"pdfs": pdfs}


# =========================
# DELETE PDF
# =========================
@router.delete("/study-upload/{filename}")
async def delete_study_pdf(filename: str):

    try:
        # DELETE FILE
        file_path = STUDY_DIR / filename

        if file_path.exists():
            file_path.unlink()

        # DELETE FROM DB
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