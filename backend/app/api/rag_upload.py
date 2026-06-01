
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks,
)

from pathlib import Path

import shutil

from app.rag.pdf_parser import (
    extract_text_from_pdf
)

from app.rag.chunker import (
    chunk_text
)

from app.rag.embeddings import (
    embedding_model
)

from app.rag.vector_store import (
    store_chunks
)

from app.rag.vector_store import (
    collection
)

router = APIRouter()

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)


def process_pdf(
    file_path: str,
    filename: str,
):

    try:

        print(
            "\n========== PDF PROCESS STARTED =========="
        )

        print(
            f"\n1. Processing File: {filename}"
        )

        # STEP 1 — Extract Text
        text = extract_text_from_pdf(
            file_path
        )

        print(
            "\n2. TEXT EXTRACTION COMPLETE"
        )

        print(
            f"Text Length: {len(text)}"
        )

        print(
            "\nFirst 500 Characters:\n"
        )

        print(text[:500])

        # STEP 2 — Chunk Text
        chunks = chunk_text(
            text=text,
            source=filename,
        )

        print(
            "\n3. CHUNKING COMPLETE"
        )

        print(
            f"Total Chunks: {len(chunks)}"
        )

        if len(chunks) > 0:

            print(
                "\nFirst Chunk:\n"
            )

            print(chunks[0])

        # STEP 3 — Generate Embeddings
        enriched_chunks = (
            embedding_model.generate_embeddings(
                chunks
            )
        )

        print(
            "\n4. EMBEDDING GENERATION COMPLETE"
        )

        print(
            f"Embeddings Generated: "
            f"{len(enriched_chunks)}"
        )

        if len(enriched_chunks) > 0:

            print(
                "\nEmbedding Dimension:"
            )

            print(
                len(
                    enriched_chunks[0][
                        "embedding"
                    ]
                )
            )

        # STEP 4 — Store in ChromaDB
        print(
            "\n5. STORING CHUNKS..."
        )

        store_chunks(
            enriched_chunks
        )

        print(
            "\n6. STORAGE COMPLETE"
        )

        print(
            "\n========== PDF PROCESS FINISHED ==========\n"
        )

    except Exception as e:

        import traceback

        traceback.print_exc()

        print(
            "\nERROR:",
            str(e)
        )


@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):

    file_path = (
        UPLOAD_DIR / file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    background_tasks.add_task(
        process_pdf,
        str(file_path),
        file.filename,
    )

    return {
        "filename": file.filename,
        "file_url":
        f"http://127.0.0.1:8000/uploads/{file.filename}"
    }


@router.get("/uploaded-pdfs")
async def get_uploaded_pdfs():

    pdfs = []

    for file in UPLOAD_DIR.glob(
        "*.pdf"
    ):

        pdfs.append(
            {
                "name": file.name,
                "url":
                f"http://127.0.0.1:8000/uploads/{file.name}"
            }
        )

    return {
        "pdfs": pdfs
    }



@router.delete("/delete-pdf/{filename}")
async def delete_pdf(filename: str):

    try:

        # DELETE FILE
        file_path = UPLOAD_DIR / filename

        if file_path.exists():

            file_path.unlink()

        # FIND ALL CHUNKS
        results = collection.get(
            where={
                "source": filename
            }
        )

        ids = results.get("ids", [])

        # DELETE EMBEDDINGS
        if ids:

            collection.delete(
                ids=ids
            )

        return {
            "message":
            f"{filename} deleted successfully"
        }

    except Exception as e:

        return {
            "error": str(e)
        }
