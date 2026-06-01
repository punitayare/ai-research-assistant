from sentence_transformers import (
    SentenceTransformer
)

import logging

logger = logging.getLogger(__name__)


class EmbeddingModel:

    def __init__(self):

        logger.info(
            "Loading embedding model..."
        )

        self.model = (
           SentenceTransformer(
   "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)
        )

        logger.info(
            "Embedding model loaded"
        )

    def generate_embeddings(
        self,
        chunks,
    ):

        try:

            logger.info(
                f"Generating embeddings "
                f"for {len(chunks)} chunks"
            )

            # Extract chunk text
            texts = [
                chunk["content"]
                for chunk in chunks
            ]

            # Generate embeddings
            embeddings = self.model.encode(
                texts,
                normalize_embeddings=True,
                batch_size=32,
                show_progress_bar=True,
            )

            enriched_chunks = []

            # Attach embeddings
            for chunk, embedding in zip(
                chunks,
                embeddings,
            ):

                enriched_chunk = {
                    "content": chunk[
                        "content"
                    ],
                    "source": chunk[
                        "source"
                    ],
                    "chunk_id": chunk[
                        "chunk_id"
                    ],
                    "embedding": (
                        embedding.tolist()
                    ),
                }

                enriched_chunks.append(
                    enriched_chunk
                )

            logger.info(
                f"Generated "
                f"{len(enriched_chunks)} embeddings"
            )

            return enriched_chunks

        except Exception:

            logger.exception(
                "Embedding generation failed"
            )

            raise


# Singleton instance
embedding_model = EmbeddingModel()