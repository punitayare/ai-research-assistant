from fastapi import APIRouter, UploadFile, File, BackgroundTasks
import shutil
from pathlib import Path

from app.rag.pdf_parser import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.embeddings import generate_embeddings
from app.rag.vector_store import store_chunks

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def process_pdf(file_path: str):

    text = extract_text_from_pdf(file_path)

    chunks = chunk_text(text)

    embeddings = generate_embeddings(chunks)

    store_chunks(chunks, embeddings)


# UPLOAD PDF

@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    file_path = UPLOAD_DIR / file.filename

    # SAVE PDF FAST

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # PROCESS IN BACKGROUND

    background_tasks.add_task(
        process_pdf,
        str(file_path)
    )

    # RETURN IMMEDIATELY

    return {
        "filename": file.filename,
        "file_url": f"http://127.0.0.1:8000/uploads/{file.filename}",
        "status": "processing"
    }


# GET ALL UPLOADED PDFs

@router.get("/uploaded-pdfs")
async def get_uploaded_pdfs():

    pdfs = []

    for file in UPLOAD_DIR.glob("*.pdf"):

        pdfs.append({
            "name": file.name,
            "url": f"http://127.0.0.1:8000/uploads/{file.name}"
        })

    return {
        "pdfs": pdfs
    }