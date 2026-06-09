print("RAG: START", flush=True)

print("RAG: importing fastapi", flush=True)
from fastapi import APIRouter, UploadFile, File, BackgroundTasks

print("RAG: importing tempfile/pathlib", flush=True)
import tempfile
from pathlib import Path

print("RAG: importing db", flush=True)
from app.db import cursor, conn

print("RAG: db imported", flush=True)

print("RAG: importing storage", flush=True)
from app.services.storage import (
    upload_pdf_to_supabase,
    delete_pdf_from_supabase
)

print("RAG: storage imported", flush=True)

print("RAG: importing pdf_parser", flush=True)
from app.rag.pdf_parser import extract_text_from_pdf

print("RAG: pdf_parser imported", flush=True)

print("RAG: importing chunker", flush=True)
from app.rag.chunker import chunk_text

print("RAG: chunker imported", flush=True)

print("RAG: importing embeddings", flush=True)
from app.rag.embeddings import embedding_model

print("RAG: embeddings imported", flush=True)

print("RAG: importing vector_store", flush=True)
from app.rag.vector_store import (
    save_document,
    store_chunks,
    collection
)

print("RAG: vector_store imported", flush=True)

print("RAG: IMPORT COMPLETE", flush=True)

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

    public_url = upload_pdf_to_supabase(
        file_bytes,
        file.filename
    )

    save_document(
        file.filename,
        public_url
    )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_bytes)
        temp_path = temp_file.name

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

        delete_pdf_from_supabase(filename)

        results = collection.get(
            where={
                "source": filename
            }
        )

        ids = results.get("ids", [])

        if ids:
            collection.delete(ids=ids)

        cursor.execute("""
            DELETE FROM documents
            WHERE filename = %s
        """, (filename,))

        conn.commit()

        return {
            "message": f"{filename} deleted successfully"
        }

    except Exception as e:

        conn.rollback()

        return {
            "error": str(e)
        }