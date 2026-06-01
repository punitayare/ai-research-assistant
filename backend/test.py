
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

text = extract_text_from_pdf(r"C:\Users\PUNIT AYARE\OneDrive\Desktop\MAIN PROJECTS\GENAI\ai-research-assistant\backend\uploads\dr.pdf")

print(text[:500])
structured_chunks = chunk_text(
    text,
    "dr.pdf"
)
print(structured_chunks[0])
embeddings = embedding_model.generate_embeddings(
    structured_chunks
)



store_chunks(
    embeddings
)
