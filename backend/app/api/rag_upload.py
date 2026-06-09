from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from pathlib import Path
import tempfile

from app.db import cursor, conn
from app.services.storage import (
    upload_pdf_to_supabase,
    delete_pdf_from_supabase
)

from app.rag.pdf_parser import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.embeddings import embedding_model
from app.rag.vector_store import (
    save_document,
    store_chunks,
    collection
)
from app.db import cursor,conn
from app.services.storage import (
    upload_pdf_to_supabase,
    delete_pdf_from_supabase
)

from app.rag.pdf_parser import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.embeddings import embedding_model
from app.rag.vector_store import (
    save_document,
    store_chunks,
    collection
)

router = APIRouter()


def process_pdf(file_path: str, filename: str):
    try:
        print("\n========== PDF PROCESS STARTED ==========")

        text = extract_text_from_pdf(file_path)

        chunks = chunk_text(
            text=text,
            source=filename
        )

        enriched_chunks = (
            embedding_model.generate_embeddings(
                chunks
            )
        )

        store_chunks(enriched_chunks)

        print(
            "\n========== PDF PROCESS COMPLETED ==========\n"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("ERROR:", str(e))


@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    file_bytes = await file.read()

    # Upload PDF to Supabase Storage
    public_url = upload_pdf_to_supabase(
        file_bytes,
        file.filename
    )

    # Save metadata to PostgreSQL
    save_document(
        file.filename,
        public_url
    )

    # Create temporary file (Windows + Linux compatible)
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_bytes)
        temp_path = temp_file.name

    # Process PDF in background
    background_tasks.add_task(
        process_pdf,
        temp_path,
        file.filename
    )

    return {
        "filename": file.filename,
        "file_url": public_url,
        "status": "processing_started"
    }



@router.get("/uploaded-pdfs")
async def get_uploaded_pdfs():

    cursor.execute("""
        SELECT filename, file_url
        FROM documents
        ORDER BY uploaded_at DESC
    """)

    rows = cursor.fetchall()

    return {
        "pdfs": [
            {
                "name": row[0],
                "url": row[1]
            }
            for row in rows
        ]
    }

@router.delete("/delete-pdf/{filename}")
async def delete_pdf(filename: str):

    try:

        # Delete from Supabase Storage
        delete_pdf_from_supabase(
            filename
        )

        # Delete vectors from ChromaDB
        results = collection.get(
            where={
                "source": filename
            }
        )

        ids = results.get(
            "ids",
            []
        )

        if ids:
            collection.delete(
                ids=ids
            )

        # Delete metadata from PostgreSQL
        cursor.execute("""
            DELETE FROM documents
            WHERE filename = %s
        """, (filename,))

        return {
            "message":
            f"{filename} deleted successfully"
        }

    except Exception as e:

        return {
            "error": str(e)
        }