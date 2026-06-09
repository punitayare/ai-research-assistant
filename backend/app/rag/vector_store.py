import os
import chromadb
import logging
from uuid import uuid4

from app.db import conn, cursor

print("VECTOR_STORE: START", flush=True)

# -----------------------------
# SAFE PERSISTENT PATH (RAILWAY SAFE)
# -----------------------------
CHROMA_PATH = os.getenv("CHROMA_PATH", "/data/chroma_db")

print(f"VECTOR_STORE: USING PATH {CHROMA_PATH}", flush=True)

try:
    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )
    print("VECTOR_STORE: CLIENT CREATED", flush=True)

    collection = client.get_or_create_collection(
        name="research_papers"
    )
    print("VECTOR_STORE: COLLECTION CREATED", flush=True)

except Exception as e:
    print(f"VECTOR_STORE ERROR: {e}", flush=True)
    raise

logger = logging.getLogger(__name__)


# -----------------------------
# NORMALIZATION HELPER
# -----------------------------
def normalize(text: str) -> str:
    return text.strip().lower()


# -----------------------------
# STORE CHUNKS (FIXED)
# -----------------------------
def store_chunks(enriched_chunks, document_id: str, filename: str):
    """
    document_id = UUID used across ALL systems
    filename = original file name (for UI only)
    """

    try:
        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for chunk in enriched_chunks:

            ids.append(str(uuid4()))

            documents.append(chunk["content"])
            embeddings.append(chunk["embedding"])

            metadatas.append({
                # 🔥 SINGLE SOURCE OF TRUTH
                "document_id": document_id,
                "filename": normalize(filename),

                "chunk_id": chunk["chunk_id"]
            })

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        logger.info(f"Stored {len(documents)} chunks")
        logger.info(f"Total chunks: {collection.count()}")

    except Exception:
        logger.exception("Failed storing chunks")
        raise


# -----------------------------
# GET DOCUMENT TEXT (FIXED)
# -----------------------------
def get_document_text(document_id: str):

    try:
        results = collection.get(
            where={
                "document_id": document_id
            }
        )

        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])

        if not documents:
            raise ValueError(f"Document '{document_id}' not found.")

        chunk_pairs = list(zip(documents, metadatas))

        chunk_pairs.sort(
            key=lambda pair: pair[1]["chunk_id"]
        )

        full_text = "\n".join(chunk for chunk, _ in chunk_pairs)

        logger.info(
            f"Loaded document '{document_id}' with {len(documents)} chunks."
        )

        return full_text

    except Exception:
        logger.exception("Failed retrieving document text")
        raise


# -----------------------------
# GET ALL DOCUMENTS (FIXED)
# -----------------------------
def get_all_documents():

    try:
        results = collection.get()

        sources = {
            metadata["document_id"]
            for metadata in results["metadatas"]
        }

        return sorted(list(sources))

    except Exception:
        logger.exception("Failed fetching documents")
        raise


# -----------------------------
# SAVE DOCUMENT (FIXED)
# -----------------------------
def save_document(document_id, filename, file_url):

    try:
        print("Saving document...")
        print(document_id)
        print(filename)
        print(file_url)

        cursor.execute("""
            INSERT INTO documents (id, filename, file_url)
            VALUES (%s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            document_id,
            filename,
            file_url
        ))

        conn.commit()

        print("Document saved!")

    except Exception as e:
        conn.rollback()
        print("DATABASE ERROR:", e)
        raise