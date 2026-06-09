print("RETRIEVER: START", flush=True)

import chromadb

print("RETRIEVER: CHROMADB IMPORTED", flush=True)

client = chromadb.PersistentClient(
    path="chroma_db"
)

print("RETRIEVER: CLIENT CREATED", flush=True)

collection = client.get_or_create_collection(
    name="research_papers"
)

print("RETRIEVER: COLLECTION CREATED", flush=True)

def retrieve_relevant_chunks(
    query: str,
    document_names=None,
    top_k=5,
):

    try:

        logger.info(
            f"Retrieving chunks "
            f"for query: {query}"
        )

        print(
            "\nSELECTED PDFs:",
            document_names
        )

        # NO PDF SELECTED
        if (
            document_names is None
            or len(document_names) == 0
        ):

            print(
                "\nNo PDFs selected"
            )

            return []

        # GENERATE QUERY EMBEDDING
        query_embedding = (
            embedding_model.model.encode(
                query,
                normalize_embeddings=True,
            ).tolist()
        )

        # STRICT PDF FILTER
        where_filter = {
            "source": {
                "$in": document_names
            }
        }

        print(
            "\nFILTER:",
            where_filter
        )

        logger.info(
            f"Filtering PDFs: "
            f"{document_names}"
        )

        # QUERY CHROMADB
        results = collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=top_k,
            where=where_filter,
        )

        documents = (
            results.get(
                "documents",
                [[]]
            )[0]
        )

        metadatas = (
            results.get(
                "metadatas",
                [[]]
            )[0]
        )

        retrieved_chunks = []

        for doc, metadata in zip(
            documents,
            metadatas,
        ):

            retrieved_chunks.append(
                {
                    "content": doc,
                    "source": metadata.get(
                        "source",
                        "Unknown",
                    ),
                    "chunk_id": metadata.get(
                        "chunk_id",
                        -1,
                    ),
                }
            )

        print(
            "\nRETRIEVED PDFs:"
        )

        for chunk in retrieved_chunks:

            print(
                chunk["source"]
            )

        logger.info(
            f"Retrieved "
            f"{len(retrieved_chunks)} chunks"
        )

        return retrieved_chunks

    except Exception:

        logger.exception(
            "Chunk retrieval failed"
        )

        return []
