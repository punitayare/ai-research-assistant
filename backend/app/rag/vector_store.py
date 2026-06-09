import chromadb
import logging

from uuid import uuid4

from app.db import conn, cursor

logger = logging.getLogger(__name__)

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="research_papers"
)


def store_chunks(
    enriched_chunks,
):
    try:

        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for chunk in enriched_chunks:

            ids.append(str(uuid4()))

            documents.append(
                chunk["content"]
            )

            embeddings.append(
                chunk["embedding"]
            )

            metadatas.append(
                {
                    "source": chunk["source"],
                    "chunk_id": chunk["chunk_id"],
                }
            )

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        logger.info(
            f"Stored {len(documents)} chunks"
        )

        logger.info(
            f"Total chunks: {collection.count()}"
        )

    except Exception:

        logger.exception(
            "Failed storing chunks"
        )

        raise


def get_document_text(
    document_name: str,
):
    """
    Reconstructs the original document
    from all stored chunks.
    """

    try:

        results = collection.get(
            where={
                "source": document_name
            }
        )

        documents = results.get(
            "documents",
            []
        )

        metadatas = results.get(
            "metadatas",
            []
        )

        if not documents:

            raise ValueError(
                f"Document '{document_name}' not found."
            )

        chunk_pairs = list(
            zip(
                documents,
                metadatas
            )
        )

        chunk_pairs.sort(
            key=lambda pair:
            pair[1]["chunk_id"]
        )

        full_text = "\n".join(
            chunk
            for chunk, _
            in chunk_pairs
        )

        logger.info(
            f"Loaded document '{document_name}' "
            f"with {len(documents)} chunks."
        )

        return full_text

    except Exception:

        logger.exception(
            "Failed retrieving document text"
        )

        raise


def get_all_documents():
    """
    Returns unique uploaded document names.
    Useful for dropdowns, mindmaps,
    dashboards, etc.
    """

    try:

        results = collection.get()

        sources = {
            metadata["source"]
            for metadata in results["metadatas"]
        }

        return sorted(
            list(sources)
        )

    except Exception:

        logger.exception(
            "Failed fetching documents"
        )

        raise

def save_document(filename, file_url):
    try:
        print("Saving document...")
        print(filename)
        print(file_url)

        cursor.execute("""
            INSERT INTO documents
            (filename, file_url)
            VALUES (%s, %s)
            ON CONFLICT (filename)
            DO NOTHING
        """, (filename, file_url))

        conn.commit()

        print("Document saved!")

    except Exception as e:
        conn.rollback()
        print("DATABASE ERROR:", e)
        raise