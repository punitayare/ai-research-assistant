from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)




def chunk_text(
    text: str,
    source: str,
):

    splitter = (
        RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
        )
    )

    raw_chunks = splitter.split_text(
        text
    )

    structured_chunks = []

    for index, chunk in enumerate(
        raw_chunks
    ):

        structured_chunks.append(
            {
                "content": chunk,
                "source": source,
                "chunk_id": index,
            }
        )

    return structured_chunks

