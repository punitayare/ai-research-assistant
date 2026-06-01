from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.mindmap_service import generate_mindmap
from app.rag.vector_store import (
    get_document_text,
    get_all_documents
)

router = APIRouter()


class MindMapRequest(BaseModel):
    document_name: str


@router.post("/mindmap")
async def create_mindmap(
    request: MindMapRequest
):

    available_docs = get_all_documents()

    if request.document_name not in available_docs:

        raise HTTPException(
            status_code=404,
            detail=f"Document '{request.document_name}' not found"
        )

    text = get_document_text(
        request.document_name
    )

    result = generate_mindmap(text)

    return result