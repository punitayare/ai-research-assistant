print("RAG: START", flush=True)

print("RAG: importing fastapi", flush=True)
from fastapi import APIRouter, UploadFile, File, BackgroundTasks

print("RAG: importing tempfile/pathlib", flush=True)
import tempfile
from pathlib import Path

print("RAG: importing uuid", flush=True)
from uuid import uuid4

print("RAG: importing db", flush=True)
from app.db import cursor, conn

print("RAG: importing storage", flush=True)
from app.services.storage import (
    upload_pdf_to_supabase,
    delete_pdf_from_supabase
)

print("RAG: importing pdf_parser", flush=True)
from app.rag.pdf_parser import extract_text_from_pdf

print("RAG: importing chunker", flush=True)
from app.rag.chunker import chunk_text

print("RAG: importing embeddings", flush=True)
from app.rag.embeddings import embedding_model

print("RAG: importing vector_store", flush=True)
from app.rag.vector_store import (
    save_document,
    store_chunks,
    collection
)

print("RAG: IMPORT COMPLETE", flush=True)

router = APIRouter()


# ----------------------------
# PROCESS PDF (FIXED)
# ----------------------------
def process_pdf(file_path: str, filename: str, document_id: str):
    try:
        print("\n========== PDF PROCESS STARTED ==========")

        text = extract_text_from_pdf(file_path)

        chunks = chunk_text(
            text=text,
            source=filename
        )

        enriched_chunks = embedding_model.generate_embeddings(chunks)

        # 🔥 FIX: pass document_id into vector store
        store_chunks(
            enriched_chunks,
            document_id=document_id,
            filename=filename
        )

        print("\n========== PDF PROCESS COMPLETED ==========\n")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("ERROR:", str(e))


# ----------------------------
# UPLOAD ENDPOINT (FIXED)
# ----------------------------
@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    file_bytes = await file.read()

    # 🔥 IMPORTANT: single source of truth ID
    document_id = str(uuid4())

    public_url = upload_pdf_to_supabase(
        file_bytes,
        file.filename
    )

    # 🔥 FIXED: correct function signature
    save_document(
        document_id=document_id,
        filename=file.filename,
        file_url=public_url
    )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_bytes)
        temp_path = temp_file.name

    # 🔥 FIXED: pass document_id into background task
    background_tasks.add_task(
        process_pdf,
        temp_path,
        file.filename,
        document_id
    )

    return {
        "document_id": document_id,
        "filename": file.filename,
        "file_url": public_url,
        "status": "processing_started"
    }


# ----------------------------
# GET UPLOADED PDFs
# ----------------------------
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


# ----------------------------
# DELETE PDF (STILL filename-based - OK for UI)
# ----------------------------
@router.delete("/delete-pdf/{filename}")
async def delete_pdf(filename: str):

    try:

        delete_pdf_from_supabase(filename)

        # ⚠️ NOTE: better would be document_id-based deletion
        results = collection.get(
            where={
                "filename": filename
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