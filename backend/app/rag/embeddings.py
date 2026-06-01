from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)


class EmbeddingModel:

    def __init__(self):
        self.model = None

    def get_model(self):

        if self.model is None:

            logger.info(
                "Loading embedding model..."
            )

            self.model = SentenceTransformer(
                "sentence-transformers/all-MiniLM-L6-v2"
            )

            logger.info(
                "Embedding model loaded"
            )

        return self.model

    def generate_embeddings(
        self,
        chunks,
    ):

        try:

            logger.info(
                f"Generating embeddings "
                f"for {len(chunks)} chunks"
            )

            texts = [
                chunk["content"]
                for chunk in chunks
            ]

            model = self.get_model()

            embeddings = model.encode(
                texts,
                normalize_embeddings=True,
                batch_size=16,
                show_progress_bar=False,
            )

            enriched_chunks = []

            for chunk, embedding in zip(
                chunks,
                embeddings,
            ):

                enriched_chunks.append(
                    {
                        "content": chunk["content"],
                        "source": chunk["source"],
                        "chunk_id": chunk["chunk_id"],
                        "embedding": embedding.tolist(),
                    }
                )

            logger.info(
                f"Generated {len(enriched_chunks)} embeddings"
            )

            return enriched_chunks

        except Exception:

            logger.exception(
                "Embedding generation failed"
            )

            raise


# Singleton instance (safe now because model isn't loaded yet)
embedding_model = EmbeddingModel()